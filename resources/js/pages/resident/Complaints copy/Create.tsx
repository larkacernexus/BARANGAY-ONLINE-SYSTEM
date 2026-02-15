import ResidentLayout from '@/layouts/resident-app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
    PawPrint,
    Droplets,
    Stethoscope,
    Leaf,
    Lightbulb,
    Store,
    Hammer,
    Eye,
    Sparkles,
    Search,
    Filter,
    Zap,
    Waves,
    HeartPulse,
    Building,
    Volume,
    Shield as ShieldIcon,
    AlertOctagon,
    Heart,
    Zap as Bolt,
    Flag,
    AlertOctagon as IssueIcon,
    Construction,
    TrafficCone,
    Building2,
    TreePine,
    LightbulbOff,
    Wrench,
    Cable,
    CloudRain,
    ParkingCircle,
    Lamp,
    Fence,
    Megaphone,
    UserX,
    EarOff,
    Gavel,
    Handshake,
    Bell,
    Ban,
    AlertCircle as AlertCircleIcon,
    Building as BuildingIcon,
    Heart as HeartIcon,
    Trees,
    Droplet,
    Power,
    Route as Road,
    Sprout,
    Factory,
    Wind,
    Ship,
    Train,
    Plane,
    Music,
    PartyPopper,
    Drill,
    Siren,
    Dog,
    Cat,
    Bird,
    Rat,
    Worm as Snake,
    Fish,
    Bug,
    Cloud,
    Sun,
    Thermometer,
    Flame as Fire,
    AlertTriangle as WarningIcon
} from 'lucide-react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { route } from 'ziggy-js';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FileWithPreview extends File {
    preview: string;
    id: string;
}

interface ReportType {
    id: number;
    name: string;
    code: string;
    description: string;
    icon: string;
    color: string;
    priority_level: number;
    resolution_days: number;
    is_active: boolean;
    requires_immediate_action: boolean;
    requires_evidence: boolean;
    allows_anonymous: boolean;
    required_fields: any;
    resolution_steps: any;
    assigned_to_roles: any;
    priority_label: string;
    priority_color: string;
    priority_icon: string;
    expected_resolution_date: string;
    formatted_required_fields: any;
    category: 'issue' | 'complaint';
    subcategory: string;
}

interface PageProps {
    reportTypes?: ReportType[];
    auth: any;
}

export default function CommunityReport() {
    const { reportTypes = [], auth = {} } = usePage<PageProps>().props;
    
    // Safeguard all data access
    const safeReportTypes = Array.isArray(reportTypes) ? reportTypes : [];
    const safeUser = auth?.user || {};
    
    const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
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
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [reportCategory, setReportCategory] = useState<'issue' | 'complaint'>('issue');
    const [urgencyLevel, setUrgencyLevel] = useState<'low' | 'medium' | 'high'>('medium');
    const [recurringIssue, setRecurringIssue] = useState(false);
    const [affectedPeople, setAffectedPeople] = useState<string>('individual');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const formRef = useRef<HTMLFormElement>(null);

    const { data, setData, post, processing, errors } = useForm({
        report_type_id: null as number | null,
        category: 'issue' as 'issue' | 'complaint',
        title: '',
        description: '',
        location: '',
        incident_date: '',
        incident_time: '',
        urgency_level: 'medium' as 'low' | 'medium' | 'high',
        recurring_issue: false,
        affected_people: 'individual',
        estimated_affected_count: 1,
        is_anonymous: false,
        evidence: [] as File[],
        reporter_name: safeUser.name || '',
        reporter_contact: safeUser.phone || '',
        reporter_address: safeUser.address || '',
        detailed_description: '',
        perpetrator_details: '',
        preferred_resolution: '',
        has_previous_report: false,
        previous_report_id: '',
        impact_level: 'minor',
        safety_concern: false,
        environmental_impact: false,
        noise_level: 'moderate',
        duration_hours: 1,
    });

    // Enhanced icon mapping
    const iconMap: Record<string, React.ComponentType<any>> = {
        // Complaints icons
        'volume-2': Volume2,
        'user-x': UserX,
        'ear-off': EarOff,
        'gavel': Gavel,
        'handshake': Handshake,
        'bell': Bell,
        'ban': Ban,
        'megaphone': Megaphone,
        'message-square': MessageSquare,
        
        // Issues icons
        'droplets': Droplets,
        'zap': Zap,
        'trash-2': Trash2,
        'road': Road,
        'wrench': Wrench,
        'building': Building,
        'trees': Trees,
        'droplet': Droplet,
        'power': Power,
        'sprout': Sprout,
        'factory': Factory,
        'wind': Wind,
        
        // Emergency & Safety
        'alert-octagon': AlertOctagon,
        'shield-alert': ShieldAlert,
        'siren': Siren,
        'fire': Fire,
        
        // Animals
        'paw-print': PawPrint,
        'dog': Dog,
        'cat': Cat,
        'bird': Bird,
        'rat': Rat,
        'snake': Snake,
        'fish': Fish,
        'bug': Bug,
        
        // Other
        'users': Users,
        'heart-pulse': HeartPulse,
        'car': Car,
        'waves': Waves,
        'store': Store,
        'alert-triangle': AlertTriangle,
        'volume': Volume,
        'shield': ShieldIcon,
        'heart': Heart,
        'bolt': Bolt,
        'alert-circle': AlertCircle,
        'clock': Clock,
        'info': Info,
        'flag': Flag,
        'construction': Construction,
        'traffic-cone': TrafficCone,
        'building-2': Building2,
        'tree-pine': TreePine,
        'lightbulb-off': LightbulbOff,
        'cable': Cable,
        'cloud-rain': CloudRain,
        'parking-circle': ParkingCircle,
        'lamp': Lamp,
        'fence': Fence,
        'drill': Drill,
        'music': Music,
        'party-popper': PartyPopper,
        'ship': Ship,
        'train': Train,
        'plane': Plane,
        'cloud': Cloud,
        'sun': Sun,
        'thermometer': Thermometer,
        'warning': WarningIcon,
        'default': AlertCircle
    };

    // Category grouping with enhanced subcategories
    const getCategory = (type: ReportType): string => {
        const categoryMap: Record<string, string> = {
            // Complaints
            'NOISE_COMPLAINT': 'noise',
            'NEIGHBOR_DISPUTE': 'neighbor',
            'PROPERTY_ENCROACHMENT': 'property',
            'NUISANCE_BEHAVIOR': 'public-nuisance',
            'ILLEGAL_ACTIVITY': 'illegal',
            'ANIMAL_NUISANCE': 'animals',
            'PARKING_DISPUTE': 'parking',
            'TRESPASSING': 'safety',
            'HARASSMENT': 'safety',
            'CONSTRUCTION_NUISANCE': 'construction',
            
            // Issues
            'WASTE_MANAGEMENT': 'sanitation',
            'WATER_PROBLEM': 'utilities',
            'ELECTRICAL_ISSUE': 'utilities',
            'ROAD_MAINTENANCE': 'infrastructure',
            'PUBLIC_SAFETY': 'safety',
            'DRAINAGE_CLOGGED': 'drainage',
            'STREET_LIGHT': 'infrastructure',
            'PARKS_MAINTENANCE': 'public-space',
            'GRAFFITI': 'vandalism',
            'SIDEWALK_DAMAGE': 'infrastructure',
            'SEWER_PROBLEM': 'utilities',
            'AIR_POLLUTION': 'environment',
            'OVERGROWN_VEGETATION': 'environment',
            'PEST_INFESTATION': 'health',
            'ILLEGAL_DUMPING': 'environment',
            'TRAFFIC_HAZARD': 'traffic',
            'PUBLIC_FACILITY': 'facilities',
            'HEALTH_HAZARD': 'health',
            'FLOODING': 'emergency',
            'POWER_OUTAGE': 'emergency',
            'GAS_LEAK': 'emergency',
            'FALLEN_TREE': 'emergency',
        };
        
        return categoryMap[type.code] || 'other';
    };

    const categoryColors: Record<string, { bg: string; icon: string; border: string; label: string; category: 'issue' | 'complaint' }> = {
        // Complaint categories
        'noise': {
            bg: 'bg-orange-100 dark:bg-orange-900/30',
            icon: 'text-orange-600 dark:text-orange-400',
            border: 'border-orange-200 dark:border-orange-800',
            label: 'Noise Complaints',
            category: 'complaint'
        },
        'neighbor': {
            bg: 'bg-pink-100 dark:bg-pink-900/30',
            icon: 'text-pink-600 dark:text-pink-400',
            border: 'border-pink-200 dark:border-pink-800',
            label: 'Neighbor Issues',
            category: 'complaint'
        },
        'property': {
            bg: 'bg-violet-100 dark:bg-violet-900/30',
            icon: 'text-violet-600 dark:text-violet-400',
            border: 'border-violet-200 dark:border-violet-800',
            label: 'Property Disputes',
            category: 'complaint'
        },
        'public-nuisance': {
            bg: 'bg-rose-100 dark:bg-rose-900/30',
            icon: 'text-rose-600 dark:text-rose-400',
            border: 'border-rose-200 dark:border-rose-800',
            label: 'Public Nuisance',
            category: 'complaint'
        },
        'illegal': {
            bg: 'bg-red-100 dark:bg-red-900/30',
            icon: 'text-red-600 dark:text-red-400',
            border: 'border-red-200 dark:border-red-800',
            label: 'Illegal Activities',
            category: 'complaint'
        },
        'parking': {
            bg: 'bg-amber-100 dark:bg-amber-900/30',
            icon: 'text-amber-600 dark:text-amber-400',
            border: 'border-amber-200 dark:border-amber-800',
            label: 'Parking Issues',
            category: 'complaint'
        },
        'construction': {
            bg: 'bg-yellow-100 dark:bg-yellow-900/30',
            icon: 'text-yellow-600 dark:text-yellow-400',
            border: 'border-yellow-200 dark:border-yellow-800',
            label: 'Construction Issues',
            category: 'complaint'
        },
        
        // Issue categories
        'sanitation': {
            bg: 'bg-emerald-100 dark:bg-emerald-900/30',
            icon: 'text-emerald-600 dark:text-emerald-400',
            border: 'border-emerald-200 dark:border-emerald-800',
            label: 'Sanitation & Waste',
            category: 'issue'
        },
        'utilities': {
            bg: 'bg-blue-100 dark:bg-blue-900/30',
            icon: 'text-blue-600 dark:text-blue-400',
            border: 'border-blue-200 dark:border-blue-800',
            label: 'Utilities',
            category: 'issue'
        },
        'infrastructure': {
            bg: 'bg-gray-100 dark:bg-gray-800',
            icon: 'text-gray-600 dark:text-gray-400',
            border: 'border-gray-200 dark:border-gray-700',
            label: 'Infrastructure',
            category: 'issue'
        },
        'drainage': {
            bg: 'bg-cyan-100 dark:bg-cyan-900/30',
            icon: 'text-cyan-600 dark:text-cyan-400',
            border: 'border-cyan-200 dark:border-cyan-800',
            label: 'Drainage & Flooding',
            category: 'issue'
        },
        'public-space': {
            bg: 'bg-green-100 dark:bg-green-900/30',
            icon: 'text-green-600 dark:text-green-400',
            border: 'border-green-200 dark:border-green-800',
            label: 'Public Spaces',
            category: 'issue'
        },
        'vandalism': {
            bg: 'bg-purple-100 dark:bg-purple-900/30',
            icon: 'text-purple-600 dark:text-purple-400',
            border: 'border-purple-200 dark:border-purple-800',
            label: 'Vandalism',
            category: 'issue'
        },
        'environment': {
            bg: 'bg-teal-100 dark:bg-teal-900/30',
            icon: 'text-teal-600 dark:text-teal-400',
            border: 'border-teal-200 dark:border-teal-800',
            label: 'Environment',
            category: 'issue'
        },
        'health': {
            bg: 'bg-rose-100 dark:bg-rose-900/30',
            icon: 'text-rose-600 dark:text-rose-400',
            border: 'border-rose-200 dark:border-rose-800',
            label: 'Health & Safety',
            category: 'issue'
        },
        'traffic': {
            bg: 'bg-indigo-100 dark:bg-indigo-900/30',
            icon: 'text-indigo-600 dark:text-indigo-400',
            border: 'border-indigo-200 dark:border-indigo-800',
            label: 'Traffic & Roads',
            category: 'issue'
        },
        'facilities': {
            bg: 'bg-lime-100 dark:bg-lime-900/30',
            icon: 'text-lime-600 dark:text-lime-400',
            border: 'border-lime-200 dark:border-lime-800',
            label: 'Public Facilities',
            category: 'issue'
        },
        'emergency': {
            bg: 'bg-red-100 dark:bg-red-900/30',
            icon: 'text-red-600 dark:text-red-400',
            border: 'border-red-200 dark:border-red-800',
            label: 'Emergency Issues',
            category: 'issue'
        },
        'animals': {
            bg: 'bg-amber-100 dark:bg-amber-900/30',
            icon: 'text-amber-600 dark:text-amber-400',
            border: 'border-amber-200 dark:border-amber-800',
            label: 'Animal Issues',
            category: 'complaint'
        },
        'safety': {
            bg: 'bg-red-100 dark:bg-red-900/30',
            icon: 'text-red-600 dark:text-red-400',
            border: 'border-red-200 dark:border-red-800',
            label: 'Safety Concerns',
            category: 'complaint'
        },
        'other': {
            bg: 'bg-slate-100 dark:bg-slate-800',
            icon: 'text-slate-600 dark:text-slate-400',
            border: 'border-slate-200 dark:border-slate-700',
            label: 'Other',
            category: 'issue'
        }
    };

    // Filter active report types
    const activeReportTypes = safeReportTypes.filter((type: ReportType) => type.is_active);

    // Filter by selected category (issue/complaint)
    const filteredByCategory = activeReportTypes.filter((type: ReportType) => {
        if (reportCategory === 'all') return true;
        return type.category === reportCategory;
    });

    // Apply search and category filters
    const filteredTypes = filteredByCategory.filter((type: ReportType) => {
        const matchesSearch = searchQuery === '' || 
            type.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            type.description.toLowerCase().includes(searchQuery.toLowerCase());
        
        const category = getCategory(type);
        const matchesCategory = selectedCategory === 'all' || category === selectedCategory;
        
        return matchesSearch && matchesCategory;
    });

    // Group by category
    const groupedTypes = filteredTypes.reduce((acc: Record<string, ReportType[]>, type: ReportType) => {
        const category = getCategory(type);
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(type);
        return acc;
    }, {} as Record<string, ReportType[]>);

    const selectedType = activeReportTypes.find((type: ReportType) => type.id === selectedTypeId);

    // Get unique categories for filter
    const categories = Array.from(new Set(filteredByCategory.map((type: ReportType) => getCategory(type)))).sort();

    // Check if mobile
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
            files.forEach(file => {
                if (file.preview) {
                    URL.revokeObjectURL(file.preview);
                }
            });
        };
    }, [files]);

    // Handle scroll for mobile buttons
    useEffect(() => {
        if (!isMobile) return;

        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            const scrollThreshold = 100;
            const scrollDelta = Math.abs(currentScrollY - lastScrollY);
            
            if (scrollDelta < 5) return;
            
            if (currentScrollY > lastScrollY && currentScrollY > scrollThreshold) {
                setTimeout(() => setIsButtonsVisible(false), 100);
            } else if (currentScrollY < lastScrollY) {
                setIsButtonsVisible(true);
            }
            
            if (currentScrollY < 30) {
                setIsButtonsVisible(true);
            }
            
            setLastScrollY(currentScrollY);
        };

        let timeoutId: NodeJS.Timeout;
        const debouncedHandleScroll = () => {
            if (timeoutId) clearTimeout(timeoutId);
            timeoutId = setTimeout(handleScroll, 50);
        };

        window.addEventListener('scroll', debouncedHandleScroll, { passive: true });
        
        return () => {
            window.removeEventListener('scroll', debouncedHandleScroll);
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [isMobile, lastScrollY]);

    // Form navigation
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

    // File handling
    const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(event.target.files || []);
        
        if (selectedFiles.length + files.length > 10) {
            toast.error('Maximum 10 files allowed');
            return;
        }
        
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

        const newFiles = validFiles.map(file => ({
            ...file,
            preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : '',
            id: Math.random().toString(36).substr(2, 9)
        })) as FileWithPreview[];

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

    // Form validation
    const validateForm = useCallback(() => {
        const errors = [];
        if (!data.report_type_id) errors.push('Please select a report type');
        if (!data.title.trim()) errors.push('Title is required');
        if (!data.description.trim()) errors.push('Description is required');
        if (!data.location.trim()) errors.push('Location is required');
        if (data.description.trim().length < 20) errors.push('Description should be at least 20 characters');
        
        // Additional validation for complaints
        if (selectedType?.category === 'complaint') {
            if (!data.perpetrator_details.trim()) {
                errors.push('Please provide details about the involved party');
            }
        }
        
        // Check if selected type requires evidence
        if (selectedType?.requires_evidence && files.length === 0) {
            errors.push('Evidence is required for this type of report');
        }
        
        return errors;
    }, [data, selectedType, files]);

    // Form submission
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
        
        post(route('resident.community-reports.store'), {
            data: {
                ...data,
                category: reportCategory,
                urgency_level: urgencyLevel,
                recurring_issue: recurringIssue,
                affected_people: affectedPeople,
            },
            onSuccess: () => {
                toast.success('Report submitted successfully!', {
                    duration: 5000,
                    action: {
                        label: 'View Status',
                        onClick: () => window.location.href = route('resident.community-reports.index')
                    }
                });
                localStorage.removeItem('report_draft');
            },
            onError: (errors) => {
                if (errors.server) {
                    toast.error('Server error. Please try again later.');
                } else {
                    const errorMessages = Object.values(errors).flat();
                    errorMessages.forEach(msg => toast.error(msg));
                }
            },
            onFinish: () => {
                setIsSubmitting(false);
                setIsUploading(false);
                setShowValidation(false);
            },
        });
    }, [data, selectedType, reportCategory, urgencyLevel, recurringIssue, affectedPeople, post, validateForm]);

    const handleSaveDraft = useCallback(() => {
        const draft = {
            report_type_id: data.report_type_id,
            category: reportCategory,
            title: data.title,
            description: data.description,
            location: data.location,
            incident_date: data.incident_date,
            incident_time: data.incident_time,
            urgency_level: urgencyLevel,
            recurring_issue: recurringIssue,
            affected_people: affectedPeople,
            is_anonymous: data.is_anonymous,
            files: files.map(f => f.name),
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('report_draft', JSON.stringify(draft));
        toast.success('Draft saved', {
            description: 'Your report has been saved as a draft.',
            duration: 3000
        });
    }, [data, reportCategory, urgencyLevel, recurringIssue, affectedPeople, files]);

    const handleAnonymousToggle = useCallback(() => {
        if (selectedType && !selectedType.allows_anonymous) {
            toast.error('This report type does not allow anonymous reporting');
            return;
        }
        
        const newValue = !anonymous;
        setAnonymous(newValue);
        setData('is_anonymous', newValue);
        
        toast.info(newValue ? 
            'Your report will be submitted anonymously.' :
            'Your identity will be visible for follow-up.',
            { duration: 3000 }
        );
    }, [anonymous, selectedType, setData]);

    // Load draft if exists
    useEffect(() => {
        const savedDraft = localStorage.getItem('report_draft');
        if (savedDraft) {
            try {
                const draft = JSON.parse(savedDraft);
                const shouldLoad = window.confirm('You have a saved draft. Would you like to continue?');
                
                if (shouldLoad) {
                    setData(draft);
                    setSelectedTypeId(draft.report_type_id);
                    setReportCategory(draft.category || 'issue');
                    setUrgencyLevel(draft.urgency_level || 'medium');
                    setRecurringIssue(draft.recurring_issue || false);
                    setAffectedPeople(draft.affected_people || 'individual');
                    setAnonymous(draft.is_anonymous);
                    toast.info('Draft loaded');
                }
            } catch (error) {
                console.error('Error loading draft:', error);
                localStorage.removeItem('report_draft');
            }
        }
    }, [setData]);

    // Progress steps for mobile
    const steps = [
        { number: 1, title: 'Category', description: 'Select report type' },
        { number: 2, title: 'Details', description: 'Add information' },
        { number: 3, title: 'Evidence', description: 'Attach files' },
        { number: 4, title: 'Review', description: 'Submit report' },
    ];

    // Compact TypeButton component
    const TypeButton = ({ type, isSelected, onSelect }: {
        type: ReportType;
        isSelected: boolean;
        onSelect: () => void;
    }) => {
        const category = getCategory(type);
        const colors = categoryColors[category] || categoryColors.other;
        const IconComponent = iconMap[type.icon] || iconMap.default;
        
        return (
            <button
                type="button"
                className={`relative overflow-hidden rounded-lg p-3 cursor-pointer transition-all text-left border w-full ${
                    isSelected 
                        ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 ring-1 ring-blue-500/20' 
                        : `${colors.border} hover:border-blue-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50`
                }`}
                onClick={onSelect}
            >
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${colors.bg}`}>
                        <IconComponent className={`h-4 w-4 ${colors.icon}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                            <div className="font-medium text-sm truncate">{type.name}</div>
                            <Badge 
                                variant="outline" 
                                className={`text-xs px-1.5 py-0 h-4 ${
                                    type.category === 'complaint' 
                                        ? 'border-red-200 text-red-700 dark:text-red-400'
                                        : 'border-blue-200 text-blue-700 dark:text-blue-400'
                                }`}
                            >
                                {type.category === 'complaint' ? 'Complaint' : 'Issue'}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge 
                                variant="outline" 
                                className={`text-xs px-1.5 py-0 h-4 ${
                                    type.priority_level === 1 ? 'border-red-200 text-red-700 dark:text-red-400' :
                                    type.priority_level === 2 ? 'border-amber-200 text-amber-700 dark:text-amber-400' :
                                    'border-green-200 text-green-700 dark:text-green-400'
                                }`}
                            >
                                {type.priority_label}
                            </Badge>
                            <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {type.resolution_days} days
                            </span>
                        </div>
                    </div>
                </div>
            </button>
        );
    };

    return (
        <ResidentLayout
            title="Community Report"
            breadcrumbs={[
                { title: 'Dashboard', href: '/resident/dashboard' },
                { title: 'My Reports', href: '/resident/community-reports' },
                { title: 'Submit Report', href: '/resident/community-reports/create' }
            ]}
        >
            <div className="space-y-4 md:space-y-6">
                <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                    {/* Mobile Header */}
                    {isMobile && (
                        <div className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
                            <div className="p-4">
                                <div className="flex items-center gap-3">
                                    <Link href="/resident/community-reports" className="flex-shrink-0">
                                        <Button type="button" variant="ghost" size="icon" className="h-10 w-10 rounded-full">
                                            <ArrowLeft className="h-5 w-5" />
                                        </Button>
                                    </Link>
                                    <div className="flex-1 min-w-0">
                                        <h1 className="text-lg font-bold truncate">Community Report</h1>
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
                                    <Link href="/resident/community-reports">
                                        <Button variant="ghost" size="sm" className="gap-2">
                                            <ArrowLeft className="h-4 w-4" />
                                            Back
                                        </Button>
                                    </Link>
                                    <div>
                                        <h1 className="text-3xl font-bold tracking-tight">Community Report</h1>
                                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                                            Report issues or file complaints to improve our community
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
                                {/* Step 1: Report Type Selection */}
                                {(!isMobile || activeStep === 1) && (
                                    <div className="pb-32 lg:pb-0">
                                        <div className="pb-4">
                                            <h2 className="text-lg font-bold flex items-center gap-2">
                                                <span className="flex items-center justify-center w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full text-sm font-bold">
                                                    1
                                                </span>
                                                Select Report Type
                                            </h2>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                Choose whether you're reporting an issue or filing a complaint
                                            </p>
                                        </div>
                                        
                                        {/* Report Category Toggle */}
                                        <div className="mb-4">
                                            <Tabs 
                                                defaultValue="issue" 
                                                value={reportCategory}
                                                onValueChange={(value) => setReportCategory(value as 'issue' | 'complaint')}
                                                className="w-full"
                                            >
                                                <TabsList className="grid grid-cols-2 mb-4">
                                                    <TabsTrigger value="issue" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                                                        <AlertCircle className="h-4 w-4 mr-2" />
                                                        Report an Issue
                                                    </TabsTrigger>
                                                    <TabsTrigger value="complaint" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
                                                        <Megaphone className="h-4 w-4 mr-2" />
                                                        File a Complaint
                                                    </TabsTrigger>
                                                </TabsList>
                                            </Tabs>
                                            
                                            {/* Category Description */}
                                            <div className={`p-3 rounded-lg mb-4 ${
                                                reportCategory === 'complaint' 
                                                    ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                                                    : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                                            }`}>
                                                <div className="flex items-start gap-2">
                                                    {reportCategory === 'complaint' ? (
                                                        <>
                                                            <Megaphone className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5" />
                                                            <div>
                                                                <p className="font-medium text-red-800 dark:text-red-300">
                                                                    Filing a Complaint
                                                                </p>
                                                                <p className="text-sm text-red-700 dark:text-red-400">
                                                                    Report concerns about individuals, businesses, or activities affecting you or the community
                                                                </p>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                                                            <div>
                                                                <p className="font-medium text-blue-800 dark:text-blue-300">
                                                                    Reporting an Issue
                                                                </p>
                                                                <p className="text-sm text-blue-700 dark:text-blue-400">
                                                                    Report problems with infrastructure, environment, or public services
                                                                </p>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Compact Search and Filter */}
                                        <div className="space-y-3 mb-4">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <Input
                                                    placeholder="Search report types..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="pl-9 h-10 rounded-lg"
                                                />
                                            </div>
                                            
                                            {/* Horizontal scrollable category filter */}
                                            {categories.length > 0 && (
                                                <div className="overflow-x-auto pb-2">
                                                    <div className="flex gap-2 min-w-max">
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedCategory('all')}
                                                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                                                                selectedCategory === 'all'
                                                                    ? 'bg-blue-600 text-white'
                                                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                                            }`}
                                                        >
                                                            All Categories
                                                        </button>
                                                        {categories.map(category => (
                                                            <button
                                                                key={category}
                                                                type="button"
                                                                onClick={() => setSelectedCategory(category)}
                                                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                                                                    selectedCategory === category
                                                                        ? 'bg-blue-600 text-white'
                                                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                                                }`}
                                                            >
                                                                {categoryColors[category]?.label || category}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Selected Type Preview - Compact */}
                                        {selectedType && (
                                            <div className={`mb-4 p-3 rounded-lg border ${
                                                selectedType.category === 'complaint'
                                                    ? 'bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/10 border-red-200 dark:border-red-800'
                                                    : 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/10 border-blue-200 dark:border-blue-800'
                                            }`}>
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${categoryColors[getCategory(selectedType)]?.bg || categoryColors.other.bg}`}>
                                                        {(() => {
                                                            const Icon = iconMap[selectedType.icon] || iconMap.default;
                                                            return <Icon className={`h-4 w-4 ${categoryColors[getCategory(selectedType)]?.icon || categoryColors.other.icon}`} />;
                                                        })()}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between">
                                                            <h4 className="font-bold text-sm truncate">
                                                                {selectedType.name}
                                                            </h4>
                                                            <div className="flex items-center gap-1">
                                                                <Badge 
                                                                    variant="outline"
                                                                    className={`text-xs ${
                                                                        selectedType.category === 'complaint'
                                                                            ? 'border-red-200 text-red-700 dark:text-red-400'
                                                                            : 'border-blue-200 text-blue-700 dark:text-blue-400'
                                                                    }`}
                                                                >
                                                                    {selectedType.category === 'complaint' ? 'Complaint' : 'Issue'}
                                                                </Badge>
                                                                <Badge 
                                                                    style={{ backgroundColor: selectedType.priority_color }}
                                                                    className="text-white text-xs"
                                                                >
                                                                    {selectedType.priority_label}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">
                                                            {selectedType.description}
                                                        </p>
                                                        <div className="flex items-center gap-4 mt-2">
                                                            <div className="text-xs">
                                                                <span className="font-medium">Resolution:</span>
                                                                <span className="text-gray-600 dark:text-gray-400 ml-1">
                                                                    {selectedType.expected_resolution_date}
                                                                </span>
                                                            </div>
                                                            <div className="text-xs">
                                                                <span className="font-medium">Evidence:</span>
                                                                <span className={`ml-1 ${selectedType.requires_evidence ? 'text-red-600' : 'text-green-600'}`}>
                                                                    {selectedType.requires_evidence ? 'Required' : 'Optional'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Report Types List - Compact Layout */}
                                        {filteredTypes.length === 0 ? (
                                            <div className="text-center py-8">
                                                <Search className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                                                <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                                                    {activeReportTypes.length === 0 
                                                        ? 'No report types available' 
                                                        : 'No matching report types'}
                                                </h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {activeReportTypes.length === 0 
                                                        ? 'Please contact support' 
                                                        : 'Try adjusting your search or filter'}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {Object.entries(groupedTypes).map(([category, types]) => (
                                                    <div key={category}>
                                                        <div className="sticky top-0 bg-white dark:bg-gray-900 py-2 z-10">
                                                            <div className="flex items-center justify-between">
                                                                <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider px-1">
                                                                    {categoryColors[category]?.label || category}
                                                                </h3>
                                                                <Badge 
                                                                    variant="outline" 
                                                                    className={`text-xs ${
                                                                        categoryColors[category]?.category === 'complaint'
                                                                            ? 'border-red-200 text-red-700 dark:text-red-400'
                                                                            : 'border-blue-200 text-blue-700 dark:text-blue-400'
                                                                    }`}
                                                                >
                                                                    {categoryColors[category]?.category === 'complaint' ? 'Complaint' : 'Issue'}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            {types.map((type) => (
                                                                <TypeButton 
                                                                    key={type.id}
                                                                    type={type}
                                                                    isSelected={selectedTypeId === type.id}
                                                                    onSelect={() => {
                                                                        setSelectedTypeId(type.id);
                                                                        setData('report_type_id', type.id);
                                                                        if (isMobile) nextStep();
                                                                    }}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Quick Tip - More Compact */}
                                        <div className="mt-4 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                            <div className="flex items-start gap-2">
                                                <Info className="h-3 w-3 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                                    {reportCategory === 'complaint' 
                                                        ? 'Complaints typically involve disputes with individuals or businesses. Provide as much detail as possible.'
                                                        : 'Issues are typically related to infrastructure, environment, or public services. Be specific about location and impact.'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Report Details */}
                                {(!isMobile || activeStep === 2) && (
                                    <div className="pb-32 lg:pb-0">
                                        <div className="pb-3">
                                            <h2 className="text-lg font-bold flex items-center gap-2">
                                                <span className="flex items-center justify-center w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full text-sm font-bold">
                                                    2
                                                </span>
                                                Provide Details
                                            </h2>
                                            {selectedType && (
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                    {selectedType.category === 'complaint'
                                                        ? 'Please provide details about your complaint'
                                                        : 'Please provide details about the issue'}
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-4">
                                            {/* Basic Information */}
                                            <div className="space-y-2">
                                                <Label htmlFor="title" className="font-medium">
                                                    Report Title *
                                                </Label>
                                                <Input
                                                    id="title"
                                                    value={data.title}
                                                    onChange={e => setData('title', e.target.value)}
                                                    placeholder={
                                                        selectedType?.category === 'complaint'
                                                            ? "e.g., Excessive noise from neighbor's party"
                                                            : "e.g., Clogged drainage on Main Street"
                                                    }
                                                    className="h-12 rounded-lg"
                                                />
                                            </div>

                                            {/* Personal Information */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="reporter_name" className="font-medium">
                                                        Your Name *
                                                    </Label>
                                                    <Input
                                                        id="reporter_name"
                                                        value={data.reporter_name}
                                                        onChange={e => setData('reporter_name', e.target.value)}
                                                        className="h-12 rounded-lg"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="reporter_contact" className="font-medium">
                                                        Contact Number *
                                                    </Label>
                                                    <Input
                                                        id="reporter_contact"
                                                        value={data.reporter_contact}
                                                        onChange={e => setData('reporter_contact', e.target.value)}
                                                        placeholder="09XXXXXXXXX"
                                                        className="h-12 rounded-lg"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="reporter_address" className="font-medium">
                                                    Your Address *
                                                </Label>
                                                <Input
                                                    id="reporter_address"
                                                    value={data.reporter_address}
                                                    onChange={e => setData('reporter_address', e.target.value)}
                                                    className="h-12 rounded-lg"
                                                />
                                            </div>

                                            {/* Detailed Description */}
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
                                                    placeholder={
                                                        selectedType?.category === 'complaint'
                                                            ? "Describe what happened, who was involved, and how it affected you..."
                                                            : "Describe the issue in detail, including what, where, and when you noticed it..."
                                                    }
                                                    rows={4}
                                                    className="resize-none rounded-lg"
                                                    maxLength={500}
                                                />
                                                <p className="text-xs text-gray-500">
                                                    {selectedType?.category === 'complaint'
                                                        ? 'Include specific dates, times, and how the incident affected you'
                                                        : 'Be specific about the location, severity, and any safety concerns'}
                                                </p>
                                            </div>

                                            {/* Complaint-specific fields */}
                                            {selectedType?.category === 'complaint' && (
                                                <div className="space-y-2">
                                                    <Label htmlFor="perpetrator_details" className="font-medium">
                                                        Involved Party Details *
                                                    </Label>
                                                    <Textarea
                                                        id="perpetrator_details"
                                                        value={data.perpetrator_details}
                                                        onChange={e => setData('perpetrator_details', e.target.value)}
                                                        placeholder="Provide details about the person/business involved (if known)..."
                                                        rows={2}
                                                        className="resize-none rounded-lg"
                                                    />
                                                    <p className="text-xs text-gray-500">
                                                        Include names, addresses, or descriptions of those involved
                                                    </p>
                                                </div>
                                            )}

                                            {/* Location and Time */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="location" className="font-medium flex items-center gap-2">
                                                        <MapPin className="h-4 w-4" />
                                                        Location *
                                                    </Label>
                                                    <Input
                                                        id="location"
                                                        value={data.location}
                                                        onChange={e => setData('location', e.target.value)}
                                                        placeholder="Where did this occur?"
                                                        className="h-12 rounded-lg"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="incident_date" className="font-medium flex items-center gap-2">
                                                        <Calendar className="h-4 w-4" />
                                                        Date Occurred *
                                                    </Label>
                                                    <Input
                                                        id="incident_date"
                                                        type="date"
                                                        value={data.incident_date}
                                                        onChange={e => setData('incident_date', e.target.value)}
                                                        className="h-12 rounded-lg"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="incident_time" className="font-medium flex items-center gap-2">
                                                    <Clock className="h-4 w-4" />
                                                    Time Occurred
                                                </Label>
                                                <Input
                                                    id="incident_time"
                                                    type="time"
                                                    value={data.incident_time}
                                                    onChange={e => setData('incident_time', e.target.value)}
                                                    className="h-12 rounded-lg"
                                                />
                                            </div>

                                            {/* Additional Information */}
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label className="font-medium">Urgency Level</Label>
                                                    <RadioGroup 
                                                        value={urgencyLevel} 
                                                        onValueChange={(value) => setUrgencyLevel(value as 'low' | 'medium' | 'high')}
                                                        className="flex gap-4"
                                                    >
                                                        <div className="flex items-center space-x-2">
                                                            <RadioGroupItem value="low" id="low" />
                                                            <Label htmlFor="low" className="font-normal">Low</Label>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <RadioGroupItem value="medium" id="medium" />
                                                            <Label htmlFor="medium" className="font-normal">Medium</Label>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <RadioGroupItem value="high" id="high" />
                                                            <Label htmlFor="high" className="font-normal">High</Label>
                                                        </div>
                                                    </RadioGroup>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <Label htmlFor="recurring" className="font-medium">
                                                        Recurring Issue/Complaint?
                                                    </Label>
                                                    <Switch
                                                        id="recurring"
                                                        checked={recurringIssue}
                                                        onCheckedChange={setRecurringIssue}
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="font-medium">Who is affected?</Label>
                                                    <Select value={affectedPeople} onValueChange={setAffectedPeople}>
                                                        <SelectTrigger className="h-12">
                                                            <SelectValue placeholder="Select who is affected" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="individual">Just me/My household</SelectItem>
                                                            <SelectItem value="multiple">Multiple households</SelectItem>
                                                            <SelectItem value="community">Entire community</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            {/* Priority Information */}
                                            {selectedType && (
                                                <div className={`p-3 rounded-lg border ${
                                                    selectedType.category === 'complaint'
                                                        ? 'bg-gradient-to-r from-red-50 to-white dark:from-red-900/10 dark:to-gray-900 border-red-200 dark:border-red-800'
                                                        : 'bg-gradient-to-r from-blue-50 to-white dark:from-blue-900/10 dark:to-gray-900 border-blue-200 dark:border-blue-800'
                                                }`}>
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                                                                Priority: {selectedType.priority_label}
                                                            </h4>
                                                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                                                Expected resolution within {selectedType.resolution_days} business days
                                                            </p>
                                                        </div>
                                                        <Badge 
                                                            style={{ backgroundColor: selectedType.priority_color }}
                                                            className="text-white text-xs"
                                                        >
                                                            {selectedType.priority_label}
                                                        </Badge>
                                                    </div>
                                                    {selectedType.requires_immediate_action && (
                                                        <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                                                            <div className="flex items-center gap-2">
                                                                <AlertTriangle className="h-3 w-3 text-red-600" />
                                                                <span className="text-xs font-medium text-red-600">
                                                                    Immediate attention required
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
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
                                                Add Photos/Evidence {selectedType?.requires_evidence ? '*' : '(optional)'}
                                            </h2>
                                            {selectedType?.requires_evidence && (
                                                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                                                    Evidence is required for this type of report
                                                </p>
                                            )}
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
                                                className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all active:scale-[0.98] bg-gradient-to-b from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900/50 ${
                                                    selectedType?.requires_evidence && files.length === 0
                                                        ? 'border-red-300 dark:border-red-700 hover:border-red-500 dark:hover:border-red-600'
                                                        : 'border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-600'
                                                }`}
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 ${
                                                    selectedType?.requires_evidence && files.length === 0
                                                        ? 'bg-red-100 dark:bg-red-900/30'
                                                        : 'bg-blue-100 dark:bg-blue-900/30'
                                                }`}>
                                                    <Camera className={`h-6 w-6 ${
                                                        selectedType?.requires_evidence && files.length === 0
                                                            ? 'text-red-500 dark:text-red-400'
                                                            : 'text-blue-500 dark:text-blue-400'
                                                    }`} />
                                                </div>
                                                <p className="font-medium mb-1 text-sm">
                                                    {selectedType?.requires_evidence && files.length === 0
                                                        ? 'Evidence is required for this report'
                                                        : 'Add photos, videos, or documents'}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    JPG, PNG, PDF, MP4 • Max {isMobile ? '3MB' : '5MB'}
                                                </p>
                                                {selectedType?.requires_evidence && (
                                                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                                        At least one piece of evidence is required
                                                    </p>
                                                )}
                                            </div>

                                            {/* Evidence Tips */}
                                            <div className={`p-3 rounded-lg ${
                                                selectedType?.category === 'complaint'
                                                    ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
                                                    : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                                            }`}>
                                                <div className="flex items-start gap-2">
                                                    <Info className={`h-4 w-4 mt-0.5 ${
                                                        selectedType?.category === 'complaint'
                                                            ? 'text-amber-600 dark:text-amber-400'
                                                            : 'text-blue-600 dark:text-blue-400'
                                                    }`} />
                                                    <div>
                                                        <p className="text-sm font-medium mb-1">
                                                            {selectedType?.category === 'complaint'
                                                                ? 'Helpful evidence for complaints:'
                                                                : 'Helpful evidence for issues:'}
                                                        </p>
                                                        <ul className="text-xs space-y-1">
                                                            {selectedType?.category === 'complaint' ? (
                                                                <>
                                                                    <li>• Photos/videos of the incident</li>
                                                                    <li>• Screenshots of messages</li>
                                                                    <li>• Audio recordings (where legal)</li>
                                                                    <li>• Witness contact information</li>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <li>• Clear photos showing the problem</li>
                                                                    <li>• Videos demonstrating the issue</li>
                                                                    <li>• Previous reports or documents</li>
                                                                    <li>• Location markers/landmarks</li>
                                                                </>
                                                            )}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* File List */}
                                            {files.length > 0 && (
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="font-medium text-sm">Files ({files.length}/10)</h4>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                if (confirm('Remove all files?')) {
                                                                    files.forEach(file => removeFile(file.id));
                                                                }
                                                            }}
                                                            className="text-xs text-red-600 dark:text-red-400"
                                                        >
                                                            Clear all
                                                        </button>
                                                    </div>
                                                    <div className="space-y-1">
                                                        {files.map((file) => (
                                                            <div key={file.id} className="flex items-center justify-between border dark:border-gray-700 rounded-lg p-2">
                                                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                                                    {file.type.startsWith('image/') ? (
                                                                        <img 
                                                                            src={file.preview} 
                                                                            alt={file.name}
                                                                            className="w-10 h-10 object-cover rounded"
                                                                        />
                                                                    ) : (
                                                                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
                                                                            <FileText className="h-5 w-5 text-gray-500" />
                                                                        </div>
                                                                    )}
                                                                    <div className="min-w-0 flex-1">
                                                                        <p className="font-medium text-xs truncate">
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
                                                                    className="h-6 w-6"
                                                                    onClick={() => removeFile(file.id)}
                                                                >
                                                                    <X className="h-3 w-3" />
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
                                                Review & Submit
                                            </h2>
                                        </div>
                                        <div className="space-y-4">
                                            {/* Report Summary */}
                                            <div className="space-y-3">
                                                <div className={`p-3 rounded-lg ${
                                                    selectedType?.category === 'complaint'
                                                        ? 'bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/10 border border-red-200 dark:border-red-800'
                                                        : 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/10 border border-blue-200 dark:border-blue-800'
                                                }`}>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-sm text-gray-600">Report Type</span>
                                                        <div className="flex items-center gap-2">
                                                            {selectedType && (() => {
                                                                const Icon = iconMap[selectedType.icon] || iconMap.default;
                                                                return <Icon className="h-4 w-4" style={{ color: selectedType.color }} />;
                                                            })()}
                                                            <span className="font-bold text-sm">{selectedType?.name || 'Not selected'}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge 
                                                            variant="outline"
                                                            className={`text-xs ${
                                                                selectedType?.category === 'complaint'
                                                                    ? 'border-red-200 text-red-700'
                                                                    : 'border-blue-200 text-blue-700'
                                                            }`}
                                                        >
                                                            {selectedType?.category === 'complaint' ? 'Complaint' : 'Issue'}
                                                        </Badge>
                                                        {selectedType && (
                                                            <Badge 
                                                                style={{ backgroundColor: selectedType.priority_color }}
                                                                className="text-white text-xs"
                                                            >
                                                                {selectedType.priority_label}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                        <span className="text-sm text-gray-600">Location</span>
                                                        <span className="font-medium text-sm text-right max-w-[200px] truncate">
                                                            {data.location || 'Not specified'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                        <span className="text-sm text-gray-600">Date & Time</span>
                                                        <span className="font-medium text-sm">
                                                            {data.incident_date || 'Not specified'} {data.incident_time}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                        <span className="text-sm text-gray-600">Urgency</span>
                                                        <Badge 
                                                            variant="outline" 
                                                            className={`text-xs ${
                                                                urgencyLevel === 'high' ? 'border-red-200 text-red-700' :
                                                                urgencyLevel === 'medium' ? 'border-amber-200 text-amber-700' :
                                                                'border-green-200 text-green-700'
                                                            }`}
                                                        >
                                                            {urgencyLevel.charAt(0).toUpperCase() + urgencyLevel.slice(1)}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                        <span className="text-sm text-gray-600">Attachments</span>
                                                        <span className="font-medium text-sm">{files.length} files</span>
                                                    </div>
                                                </div>
                                                
                                                {selectedType && (
                                                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                        <span className="text-sm text-gray-600">Expected Resolution</span>
                                                        <span className="font-medium text-sm">
                                                            {selectedType.expected_resolution_date}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Anonymous Option */}
                                            <div className={`flex items-center justify-between p-3 border rounded-lg ${
                                                !selectedType?.allows_anonymous
                                                    ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 opacity-60'
                                                    : 'dark:border-gray-700'
                                            }`}>
                                                <div className="space-y-0.5">
                                                    <div className="font-medium text-sm flex items-center gap-2">
                                                        <Shield className="h-3 w-3" />
                                                        Report anonymously
                                                    </div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {!selectedType?.allows_anonymous
                                                            ? 'Not allowed for this report type'
                                                            : selectedType?.category === 'complaint'
                                                                ? 'Hide your identity from the involved party'
                                                                : 'Hide your identity from officials'}
                                                    </p>
                                                </div>
                                                <Switch
                                                    id="anonymous"
                                                    checked={anonymous}
                                                    onCheckedChange={handleAnonymousToggle}
                                                    className="data-[state=checked]:bg-blue-600 h-5 w-9"
                                                    disabled={!selectedType?.allows_anonymous}
                                                />
                                            </div>

                                            {/* Terms Agreement */}
                                            <div className={`p-3 border rounded-lg ${
                                                selectedType?.category === 'complaint'
                                                    ? 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20'
                                                    : 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20'
                                            }`}>
                                                <div className="flex items-start gap-2">
                                                    <Info className={`h-4 w-4 mt-0.5 ${
                                                        selectedType?.category === 'complaint'
                                                            ? 'text-amber-600 dark:text-amber-400'
                                                            : 'text-blue-600 dark:text-blue-400'
                                                    }`} />
                                                    <div>
                                                        <p className="text-sm font-medium mb-1">
                                                            {selectedType?.category === 'complaint'
                                                                ? 'Important for complaints:'
                                                                : 'By submitting, you confirm:'}
                                                        </p>
                                                        <ul className="text-xs space-y-0.5">
                                                            {selectedType?.category === 'complaint' ? (
                                                                <>
                                                                    <li>• Information provided is truthful and accurate</li>
                                                                    <li>• False complaints may result in penalties</li>
                                                                    <li>• Mediation may be offered for resolution</li>
                                                                    <li>• You agree to cooperate with the investigation</li>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <li>• All information is accurate and truthful</li>
                                                                    <li>• You're helping improve our community</li>
                                                                    <li>• You'll receive updates on the issue status</li>
                                                                    <li>• Officials may contact you for follow-up</li>
                                                                </>
                                                            )}
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
                                <div className="space-y-4">
                                    {/* Summary Card */}
                                    <div className="bg-white dark:bg-gray-900 rounded-lg border dark:border-gray-800 p-4 sticky top-4">
                                        <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                                            <IssueIcon className="h-4 w-4" />
                                            Report Summary
                                        </h3>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600">Type</span>
                                                <div className="flex items-center gap-2">
                                                    <Badge 
                                                        variant="outline"
                                                        className={`text-xs ${
                                                            selectedType?.category === 'complaint'
                                                                ? 'border-red-200 text-red-700'
                                                                : 'border-blue-200 text-blue-700'
                                                        }`}
                                                    >
                                                        {selectedType?.category === 'complaint' ? 'Complaint' : 'Issue'}
                                                    </Badge>
                                                    <span className="font-medium">{selectedType?.name || '—'}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600">Priority</span>
                                                {selectedType ? (
                                                    <Badge 
                                                        style={{ backgroundColor: selectedType.priority_color }}
                                                        className="text-white text-xs"
                                                    >
                                                        {selectedType.priority_label}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-gray-400">—</span>
                                                )}
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600">Urgency</span>
                                                <Badge 
                                                    variant="outline" 
                                                    className={`text-xs ${
                                                        urgencyLevel === 'high' ? 'border-red-200 text-red-700' :
                                                        urgencyLevel === 'medium' ? 'border-amber-200 text-amber-700' :
                                                        'border-green-200 text-green-700'
                                                    }`}
                                                >
                                                    {urgencyLevel.charAt(0).toUpperCase() + urgencyLevel.slice(1)}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600">Attachments</span>
                                                <span className="font-medium">{files.length}</span>
                                            </div>
                                            <Separator className="my-2" />
                                            <div className="text-xs space-y-1">
                                                <div className="flex items-center gap-2 font-medium">
                                                    <Clock className="h-3 w-3" />
                                                    Expected Resolution
                                                </div>
                                                <div className="font-bold text-blue-600 dark:text-blue-400">
                                                    {selectedType?.expected_resolution_date || '—'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Compact Tips */}
                                    <div className="bg-white dark:bg-gray-900 rounded-lg border dark:border-gray-800 p-4">
                                        <h3 className="text-sm font-bold flex items-center gap-2 mb-3">
                                            <Info className="h-4 w-4" />
                                            {selectedType?.category === 'complaint' ? 'Complaint Tips' : 'Helpful Tips'}
                                        </h3>
                                        <div className="space-y-2">
                                            {selectedType?.category === 'complaint' ? [
                                                "Keep evidence organized and labeled",
                                                "Note specific dates and times",
                                                "Consider mediation for neighbor disputes",
                                                "Be prepared for follow-up questions"
                                            ] : [
                                                "Take clear photos showing the issue",
                                                "Provide specific location details",
                                                "Note any safety hazards",
                                                "Check report status in your dashboard"
                                            ].map((tip, index) => (
                                                <div key={index} className="flex items-start gap-2">
                                                    <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                                                    <span className="text-xs">{tip}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
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
                                    <Link href="/resident/community-reports" className="flex-1">
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
                                        disabled={!selectedTypeId && activeStep === 1}
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
                                            'Submit Report'
                                        )}
                                    </Button>
                                )}
                            </div>
                            {activeStep === 1 && !selectedTypeId && (
                                <div className="text-center mt-2">
                                    <p className="text-xs text-amber-600 dark:text-amber-400">
                                        Please select a report type to continue
                                    </p>
                                </div>
                            )}
                            {activeStep === 4 && (
                                <div className="text-center mt-2">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Tap submit to send your report
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
                                        disabled={isSubmitting || !selectedTypeId}
                                    >
                                        Save as Draft
                                    </Button>
                                    <div className="flex items-center gap-4">
                                        <Link href="/resident/community-reports">
                                            <Button type="button" variant="ghost">
                                                Cancel
                                            </Button>
                                        </Link>
                                        <Button 
                                            type="submit" 
                                            size="lg" 
                                            className="px-8"
                                            disabled={isSubmitting || processing || !selectedTypeId}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    Submitting...
                                                </>
                                            ) : (
                                                'Submit Report'
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