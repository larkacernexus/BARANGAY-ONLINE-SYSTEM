// app/pages/admin/Reports/ReportTypes/Create.tsx
import React from 'react';
import { router, usePage } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import AppLayout from '@/layouts/admin-app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    ArrowLeft,
    Save,
    X,
    Plus,
    Trash2,
    AlertCircle,
    CheckCircle,
    FileText,
    HelpCircle,
    Sparkles,
    Copy,
    Settings,
    ListChecks,
    Activity,
    Users,
    Clock,
    Zap,
    Image,
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Target,
    GripVertical,
    ChevronDown,
    ChevronUp,
    AlertTriangle,
    Volume2,
    Map,
    Shield,
    Heart,
    Building,
    Car,
    Store,
    Eye,
    EyeOff,
    Globe,
    MessageCircle,
    Flag,
    Home,
    Flame,
    Wind,
    Sun,
    Moon,
    Cloud,
    Thermometer,
    Wifi,
    Camera,
    Video,
    Mic,
    Headphones,
    Radio,
    Tv,
    Gamepad,
    Pen,
    Pencil,
    Scissors,
    Ruler,
    Scale,
    HeartPulse,
    Pill,
    Brain,
    FlaskConical,
    Microscope,
    Dna,
    Circle,
    Square,
    Triangle,
    Hexagon,
    Octagon,
    Infinity,
    Rocket,
    Plane,
    Ship,
    Bus,
    Bike,
    Train,
    Coffee,
    Beer,
    Wine,
    Cake,
    Cookie,
    Pizza,
    Hamburger,
    Salad,
    ShieldAlert,
    Bolt,
    Flame as FlameIcon,
} from 'lucide-react';
import { route } from 'ziggy-js';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';

interface CommonType {
    name: string;
    code: string;
    description: string;
    icon: string;
    color: string;
    priority_level: number;
    resolution_days: number;
    requires_immediate_action?: boolean;
    requires_evidence?: boolean;
    allows_anonymous?: boolean;
}

interface RequiredField {
    key: string;
    label: string;
    type: string;
    required: boolean;
    placeholder?: string;
    options?: string[];
    rows?: number;
}

interface ResolutionStep {
    step: number;
    action: string;
    description: string;
}

interface PageProps {
    commonTypes: CommonType[];
    priorityOptions: Record<number, string>;
    roleOptions: Record<string, string>;
    fieldTypes: Record<string, string>;
    defaultRequiredFields: RequiredField[];
    defaultResolutionSteps: ResolutionStep[];
}

// Icon mapping with ONLY definitely valid Lucide React icons
const ICON_GROUPS = {
    alerts: [
        { value: 'alert-circle', label: 'Alert Circle', icon: AlertCircle },
        { value: 'alert-triangle', label: 'Alert Triangle', icon: AlertTriangle },
        { value: 'flame', label: 'Flame', icon: Flame },
        { value: 'shield', label: 'Shield', icon: Shield },
        { value: 'shield-alert', label: 'Shield Alert', icon: ShieldAlert },
        { value: 'rocket', label: 'Rocket', icon: Rocket },
    ],
    community: [
        { value: 'users', label: 'Users', icon: Users },
        { value: 'home', label: 'Home', icon: Home },
        { value: 'building', label: 'Building', icon: Building },
        { value: 'store', label: 'Store', icon: Store },
        { value: 'flag', label: 'Flag', icon: Flag },
        { value: 'heart-pulse', label: 'Heart Pulse', icon: HeartPulse },
    ],
    environment: [
        { value: 'cloud', label: 'Cloud', icon: Cloud },
        { value: 'wind', label: 'Wind', icon: Wind },
        { value: 'sun', label: 'Sun', icon: Sun },
        { value: 'moon', label: 'Moon', icon: Moon },
        { value: 'thermometer', label: 'Temperature', icon: Thermometer },
    ],
    transportation: [
        { value: 'car', label: 'Car', icon: Car },
        { value: 'bus', label: 'Bus', icon: Bus },
        { value: 'bike', label: 'Bike', icon: Bike },
        { value: 'train', label: 'Train', icon: Train },
        { value: 'plane', label: 'Plane', icon: Plane },
        { value: 'ship', label: 'Ship', icon: Ship },
    ],
    health: [
        { value: 'heart-pulse', label: 'Heart Pulse', icon: HeartPulse },
        { value: 'pill', label: 'Pill', icon: Pill },
        { value: 'microscope', label: 'Microscope', icon: Microscope },
        { value: 'flask-conical', label: 'Flask', icon: FlaskConical },
        { value: 'dna', label: 'DNA', icon: Dna },
        { value: 'brain', label: 'Brain', icon: Brain },
    ],
    communication: [
        { value: 'message-circle', label: 'Message', icon: MessageCircle },
        { value: 'mail', label: 'Mail', icon: Mail },
        { value: 'phone', label: 'Phone', icon: Phone },
        { value: 'wifi', label: 'WiFi', icon: Wifi },
        { value: 'radio', label: 'Radio', icon: Radio },
        { value: 'tv', label: 'TV', icon: Tv },
        { value: 'camera', label: 'Camera', icon: Camera },
        { value: 'video', label: 'Video', icon: Video },
        { value: 'mic', label: 'Microphone', icon: Mic },
        { value: 'headphones', label: 'Headphones', icon: Headphones },
    ],
    maps: [
        { value: 'map', label: 'Map', icon: Map },
        { value: 'map-pin', label: 'Map Pin', icon: MapPin },
        { value: 'globe', label: 'Globe', icon: Globe },
    ],
    files: [
        { value: 'file-text', label: 'File Text', icon: FileText },
        { value: 'image', label: 'Image', icon: Image },
        { value: 'pen', label: 'Pen', icon: Pen },
        { value: 'pencil', label: 'Pencil', icon: Pencil },
        { value: 'scissors', label: 'Scissors', icon: Scissors },
        { value: 'ruler', label: 'Ruler', icon: Ruler },
    ],
    time: [
        { value: 'clock', label: 'Clock', icon: Clock },
        { value: 'calendar', label: 'Calendar', icon: Calendar },
    ],
    targets: [
        { value: 'target', label: 'Target', icon: Target },
        { value: 'activity', label: 'Activity', icon: Activity },
        { value: 'zap', label: 'Zap', icon: Zap },
        { value: 'bolt', label: 'Bolt', icon: Bolt },
    ],
    food: [
        { value: 'coffee', label: 'Coffee', icon: Coffee },
        { value: 'beer', label: 'Beer', icon: Beer },
        { value: 'wine', label: 'Wine', icon: Wine },
        { value: 'cake', label: 'Cake', icon: Cake },
        { value: 'cookie', label: 'Cookie', icon: Cookie },
        { value: 'pizza', label: 'Pizza', icon: Pizza },
        { value: 'hamburger', label: 'Hamburger', icon: Hamburger },
        { value: 'salad', label: 'Salad', icon: Salad },
    ],
    shapes: [
        { value: 'circle', label: 'Circle', icon: Circle },
        { value: 'square', label: 'Square', icon: Square },
        { value: 'triangle', label: 'Triangle', icon: Triangle },
        { value: 'hexagon', label: 'Hexagon', icon: Hexagon },
        { value: 'octagon', label: 'Octagon', icon: Octagon },
        { value: 'infinity', label: 'Infinity', icon: Infinity },
    ],
};

// Flatten icons for select dropdown
const iconOptions = Object.values(ICON_GROUPS).flat();

// Color presets with names
const colorPresets = [
    { value: '#3B82F6', name: 'Blue' },
    { value: '#10B981', name: 'Green' },
    { value: '#F59E0B', name: 'Orange' },
    { value: '#EF4444', name: 'Red' },
    { value: '#8B5CF6', name: 'Purple' },
    { value: '#EC4899', name: 'Pink' },
    { value: '#6B7280', name: 'Gray' },
    { value: '#0EA5E9', name: 'Sky Blue' },
    { value: '#F97316', name: 'Bright Orange' },
    { value: '#DC2626', name: 'Dark Red' },
];

// Category options with descriptions
const categoryOptions = [
    { value: 'complaint', label: 'Complaint', description: 'Formal complaint about an issue', icon: AlertCircle },
    { value: 'issue', label: 'Community Issue', description: 'General community concern', icon: Users },
    { value: 'request', label: 'Request', description: 'Service or assistance request', icon: FileText },
    { value: 'concern', label: 'Concern', description: 'Safety or welfare concern', icon: HeartPulse },
    { value: 'suggestion', label: 'Suggestion', description: 'Community improvement idea', icon: Sparkles },
    { value: 'incident', label: 'Incident', description: 'Report of an incident', icon: Flag },
    { value: 'feedback', label: 'Feedback', description: 'General feedback', icon: MessageCircle },
    { value: 'inquiry', label: 'Inquiry', description: 'Information request', icon: HelpCircle },
];

export default function ReportTypeCreate() {
    const { props } = usePage<PageProps>();
    const { 
        commonTypes = [], 
        priorityOptions = {}, 
        roleOptions = {},
        fieldTypes = {},
        defaultRequiredFields = [],
        defaultResolutionSteps = []
    } = props;

    // Form state
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        description: '',
        category: '',
        subcategory: '',
        icon: 'alert-circle',
        color: '#3B82F6',
        priority_level: 3,
        resolution_days: 7,
        is_active: true,
        requires_immediate_action: false,
        requires_evidence: false,
        allows_anonymous: true,
        required_fields: defaultRequiredFields,
        resolution_steps: defaultResolutionSteps,
        assigned_to_roles: [] as string[],
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState('basic');
    const [selectedIcon, setSelectedIcon] = useState('alert-circle');
    const [showCustomFieldForm, setShowCustomFieldForm] = useState(false);
    const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(null);
    const [newField, setNewField] = useState<RequiredField>({
        key: '',
        label: '',
        type: 'text',
        required: true,
        placeholder: '',
        options: [],
    });
    const [newOption, setNewOption] = useState('');
    const [searchIconTerm, setSearchIconTerm] = useState('');
    const [showIconPicker, setShowIconPicker] = useState(false);
    const [formProgress, setFormProgress] = useState(25);
    
    // Track if code was manually edited
    const [codeManuallyEdited, setCodeManuallyEdited] = useState(false);
    const nameInputRef = useRef<HTMLInputElement>(null);
    const codeInputRef = useRef<HTMLInputElement>(null);

    // Update progress based on completed sections
    useEffect(() => {
        let progress = 25;
        
        if (formData.code && formData.name) progress += 15;
        if (formData.category) progress += 15;
        if (formData.required_fields.length > 0) progress += 15;
        if (formData.resolution_steps.length > 0) progress += 15;
        if (formData.assigned_to_roles.length > 0) progress += 15;
        
        setFormProgress(Math.min(progress, 100));
    }, [formData]);

    // Auto-generate code from name when name changes, but only if code hasn't been manually edited
    useEffect(() => {
        // Only auto-generate if:
        // 1. There is a name value
        // 2. Code hasn't been manually edited
        // 3. Code is empty OR code matches the auto-generated value from previous name
        if (formData.name && !codeManuallyEdited) {
            const generatedCode = formData.name
                .toUpperCase()
                .replace(/[^A-Z0-9]/g, '_')
                .replace(/_+/g, '_')
                .replace(/^_|_$/g, '');
            
            // Only update if the generated code is different from current code
            if (generatedCode !== formData.code) {
                setFormData(prev => ({ ...prev, code: generatedCode }));
            }
        }
    }, [formData.name, codeManuallyEdited]);

    // Handle manual code edit - set the flag to true
    const handleCodeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setFormData(prev => ({ ...prev, code: value }));
        setCodeManuallyEdited(true);
        
        // Clear error for this field
        if (errors.code) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.code;
                return newErrors;
            });
        }
    };

    // Handle name edit - reset manual edit flag if code is empty or matches generated
    const handleNameEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setFormData(prev => ({ ...prev, name: value }));
        
        // If code becomes empty, we can auto-generate again
        if (!formData.code) {
            setCodeManuallyEdited(false);
        }
        
        // Clear error for this field
        if (errors.name) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.name;
                return newErrors;
            });
        }
    };

    // Filter icons based on search
    const filteredIcons = searchIconTerm
        ? iconOptions.filter(icon => 
            icon.label.toLowerCase().includes(searchIconTerm.toLowerCase())
          )
        : iconOptions;

    // Handle input changes (for non-code/name fields)
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    // Handle select changes
    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    // Handle number changes
    const handleNumberChange = (name: string, value: string) => {
        const numValue = parseInt(value) || 0;
        setFormData(prev => ({ ...prev, [name]: numValue }));
    };

    // Handle switch changes
    const handleSwitchChange = (name: string, checked: boolean) => {
        setFormData(prev => ({ ...prev, [name]: checked }));
    };

    // Handle role selection
    const toggleRole = (role: string) => {
        setFormData(prev => {
            const current = prev.assigned_to_roles;
            if (current.includes(role)) {
                return { ...prev, assigned_to_roles: current.filter(r => r !== role) };
            } else {
                return { ...prev, assigned_to_roles: [...current, role] };
            }
        });
    };

    // Generate code from name (manual trigger)
    const generateCode = () => {
        if (formData.name) {
            const code = formData.name
                .toUpperCase()
                .replace(/[^A-Z0-9]/g, '_')
                .replace(/_+/g, '_')
                .replace(/^_|_$/g, '');
            setFormData(prev => ({ ...prev, code }));
            // Reset manual edit flag when manually generating
            setCodeManuallyEdited(false);
            toast.success('Code generated from name');
        }
    };

    // Reset manual edit flag (allow auto-generation again)
    const resetAutoGenerate = () => {
        setCodeManuallyEdited(false);
        if (formData.name) {
            const generatedCode = formData.name
                .toUpperCase()
                .replace(/[^A-Z0-9]/g, '_')
                .replace(/_+/g, '_')
                .replace(/^_|_$/g, '');
            setFormData(prev => ({ ...prev, code: generatedCode }));
            toast.success('Auto-generation re-enabled');
        }
    };

    // Load common type template
    const loadCommonType = (type: CommonType) => {
        setFormData({
            ...formData,
            code: type.code,
            name: type.name,
            description: type.description,
            icon: type.icon || 'alert-circle',
            color: type.color || '#3B82F6',
            priority_level: type.priority_level,
            resolution_days: type.resolution_days,
            requires_immediate_action: type.requires_immediate_action || false,
            requires_evidence: type.requires_evidence || false,
            allows_anonymous: type.allows_anonymous || true,
        });
        setSelectedIcon(type.icon || 'alert-circle');
        // Reset manual edit flag when loading template
        setCodeManuallyEdited(false);
        toast.success(`Template "${type.name}" loaded`);
    };

    // Required Fields Management
    const addRequiredField = () => {
        if (!newField.key || !newField.label) {
            toast.error('Key and label are required');
            return;
        }

        if (!newField.key) {
            newField.key = newField.label
                .toLowerCase()
                .replace(/[^a-z0-9]/g, '_')
                .replace(/_+/g, '_')
                .replace(/^_|_$/g, '');
        }

        setFormData(prev => ({
            ...prev,
            required_fields: [...prev.required_fields, { ...newField }]
        }));

        setNewField({
            key: '',
            label: '',
            type: 'text',
            required: true,
            placeholder: '',
            options: [],
        });
        setShowCustomFieldForm(false);
        setEditingFieldIndex(null);
        toast.success('Field added successfully');
    };

    const updateRequiredField = () => {
        if (editingFieldIndex === null) return;

        if (!newField.key || !newField.label) {
            toast.error('Key and label are required');
            return;
        }

        const updatedFields = [...formData.required_fields];
        updatedFields[editingFieldIndex] = { ...newField };

        setFormData(prev => ({
            ...prev,
            required_fields: updatedFields
        }));

        setNewField({
            key: '',
            label: '',
            type: 'text',
            required: true,
            placeholder: '',
            options: [],
        });
        setShowCustomFieldForm(false);
        setEditingFieldIndex(null);
        toast.success('Field updated successfully');
    };

    const editRequiredField = (index: number) => {
        setNewField({ ...formData.required_fields[index] });
        setEditingFieldIndex(index);
        setShowCustomFieldForm(true);
    };

    const removeRequiredField = (index: number) => {
        setFormData(prev => ({
            ...prev,
            required_fields: prev.required_fields.filter((_, i) => i !== index)
        }));
        toast.success('Field removed');
    };

    const moveFieldUp = (index: number) => {
        if (index === 0) return;
        const newFields = [...formData.required_fields];
        [newFields[index - 1], newFields[index]] = [newFields[index], newFields[index - 1]];
        setFormData(prev => ({ ...prev, required_fields: newFields }));
    };

    const moveFieldDown = (index: number) => {
        if (index === formData.required_fields.length - 1) return;
        const newFields = [...formData.required_fields];
        [newFields[index], newFields[index + 1]] = [newFields[index + 1], newFields[index]];
        setFormData(prev => ({ ...prev, required_fields: newFields }));
    };

    const addOption = () => {
        if (!newOption.trim()) return;
        setNewField(prev => ({
            ...prev,
            options: [...(prev.options || []), newOption.trim()]
        }));
        setNewOption('');
    };

    const removeOption = (index: number) => {
        setNewField(prev => ({
            ...prev,
            options: prev.options?.filter((_, i) => i !== index)
        }));
    };

    // Resolution Steps Management
    const addResolutionStep = () => {
        const nextStep = formData.resolution_steps.length + 1;
        const newStep: ResolutionStep = {
            step: nextStep,
            action: `Step ${nextStep}`,
            description: '',
        };
        setFormData(prev => ({
            ...prev,
            resolution_steps: [...prev.resolution_steps, newStep]
        }));
    };

    const updateResolutionStep = (index: number, field: keyof ResolutionStep, value: string) => {
        const updatedSteps = [...formData.resolution_steps];
        updatedSteps[index] = { ...updatedSteps[index], [field]: value };
        setFormData(prev => ({ ...prev, resolution_steps: updatedSteps }));
    };

    const removeResolutionStep = (index: number) => {
        setFormData(prev => ({
            ...prev,
            resolution_steps: prev.resolution_steps.filter((_, i) => i !== index)
        }));
        setTimeout(() => {
            const reordered = formData.resolution_steps
                .filter((_, i) => i !== index)
                .map((step, idx) => ({ ...step, step: idx + 1 }));
            setFormData(prev => ({ ...prev, resolution_steps: reordered }));
        }, 0);
    };

    // Validate form
    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.code.trim()) {
            newErrors.code = 'Code is required';
        } else if (!/^[A-Z0-9_]+$/.test(formData.code)) {
            newErrors.code = 'Code must contain only uppercase letters, numbers, and underscores';
        }

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (formData.priority_level < 1 || formData.priority_level > 4) {
            newErrors.priority_level = 'Priority level must be between 1 and 4';
        }

        if (formData.resolution_days < 1) {
            newErrors.resolution_days = 'Resolution days must be at least 1';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submit
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            setActiveTab('basic');
            toast.error('Please fix the errors in the form');
            return;
        }

        setIsSubmitting(true);

        router.post(route('report-types.store'), formData, {
            onSuccess: () => {
                toast.success('Report type created successfully');
                router.visit(route('admin.report-types.index'));
            },
            onError: (errors) => {
                setErrors(errors);
                toast.error('Failed to create report type');

                if (errors.code || errors.name || errors.category) {
                    setActiveTab('basic');
                } else if (errors.required_fields) {
                    setActiveTab('fields');
                } else if (errors.resolution_steps) {
                    setActiveTab('steps');
                }
            },
            onFinish: () => {
                setIsSubmitting(false);
            }
        });
    };

    // Handle cancel
    const handleCancel = () => {
        if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
            router.visit(route('admin.report-types.index'));
        }
    };

    return (
        <AppLayout
            title="Create Report Type"
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Report Types', href: '/admin/report-types' },
                { title: 'Create', href: '/admin/report-types/create' }
            ]}
        >
            <TooltipProvider>
                <div className="space-y-6">
                    {/* Header with Progress */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleCancel}
                                type="button"
                                className="h-8 w-8"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">Create Report Type</h1>
                                <p className="text-sm text-muted-foreground">
                                    Add a new report type to the system
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCancel}
                                disabled={isSubmitting}
                                type="button"
                            >
                                <X className="h-4 w-4 mr-2" />
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                form="report-type-form"
                                size="sm"
                                disabled={isSubmitting}
                                className="gap-2 min-w-[120px]"
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center gap-2">
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                        Creating...
                                    </div>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4" />
                                        Create Report Type
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Form Completion</span>
                            <span className="font-medium">{formProgress}%</span>
                        </div>
                        <Progress value={formProgress} className="h-2" />
                    </div>

                    {/* Template Selection */}
                    {commonTypes.length > 0 && (
                        <Card className="border-primary/20 bg-primary/5">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-primary" />
                                    Quick Start Templates
                                </CardTitle>
                                <CardDescription>
                                    Choose from common report type templates to get started quickly
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                                    {commonTypes.map((type) => {
                                        const IconComponent = iconOptions.find(i => i.value === type.icon)?.icon || AlertCircle;
                                        return (
                                            <Tooltip key={type.code}>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => loadCommonType(type)}
                                                        className="h-auto py-3 flex flex-col items-center gap-2 w-full"
                                                        style={{ borderColor: type.color + '40' }}
                                                    >
                                                        <div className="p-2 rounded-full" style={{ backgroundColor: type.color + '20' }}>
                                                            <IconComponent className="h-5 w-5" style={{ color: type.color }} />
                                                        </div>
                                                        <span className="text-xs font-medium text-center line-clamp-2">
                                                            {type.name}
                                                        </span>
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent side="bottom" className="max-w-[200px]">
                                                    <p className="text-xs">{type.description}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Main Form */}
                    <form 
                        id="report-type-form" 
                        onSubmit={handleSubmit}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                            }
                        }}
                    >
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                            <TabsList className="grid w-full grid-cols-4 lg:w-auto">
                                <TabsTrigger value="basic" className="gap-2" type="button">
                                    <FileText className="h-4 w-4" />
                                    <span className="hidden sm:inline">Basic Info</span>
                                </TabsTrigger>
                                <TabsTrigger value="fields" className="gap-2" type="button">
                                    <ListChecks className="h-4 w-4" />
                                    <span className="hidden sm:inline">Required Fields</span>
                                    {formData.required_fields.length > 0 && (
                                        <Badge variant="secondary" className="ml-1">
                                            {formData.required_fields.length}
                                        </Badge>
                                    )}
                                </TabsTrigger>
                                <TabsTrigger value="steps" className="gap-2" type="button">
                                    <Activity className="h-4 w-4" />
                                    <span className="hidden sm:inline">Resolution Steps</span>
                                    {formData.resolution_steps.length > 0 && (
                                        <Badge variant="secondary" className="ml-1">
                                            {formData.resolution_steps.length}
                                        </Badge>
                                    )}
                                </TabsTrigger>
                                <TabsTrigger value="settings" className="gap-2" type="button">
                                    <Settings className="h-4 w-4" />
                                    <span className="hidden sm:inline">Settings</span>
                                    {formData.assigned_to_roles.length > 0 && (
                                        <Badge variant="secondary" className="ml-1">
                                            {formData.assigned_to_roles.length}
                                        </Badge>
                                    )}
                                </TabsTrigger>
                            </TabsList>

                            {/* Basic Information Tab */}
                            <TabsContent value="basic" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Basic Information</CardTitle>
                                        <CardDescription>
                                            Enter the basic details for this report type
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* Code and Name */}
                                        <div className="grid gap-6 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="code" className="flex items-center gap-1">
                                                    Code
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Unique identifier (uppercase letters, numbers, underscores)</p>
                                                            {codeManuallyEdited && (
                                                                <p className="text-xs text-yellow-600 mt-1">
                                                                    Auto-generation disabled (manual edit detected)
                                                                </p>
                                                            )}
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </Label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        id="code"
                                                        name="code"
                                                        value={formData.code}
                                                        onChange={handleCodeEdit}
                                                        placeholder="e.g., NOISE_COMPLAINT"
                                                        className={`${errors.code ? 'border-destructive' : ''} ${codeManuallyEdited ? 'border-yellow-500' : ''}`}
                                                        disabled={isSubmitting}
                                                        ref={codeInputRef}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={generateCode}
                                                        disabled={!formData.name || isSubmitting}
                                                        title="Generate from name"
                                                    >
                                                        <Sparkles className="h-4 w-4" />
                                                    </Button>
                                                    {codeManuallyEdited && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={resetAutoGenerate}
                                                            disabled={isSubmitting}
                                                            title="Re-enable auto-generation"
                                                            className="text-yellow-600 hover:text-yellow-700"
                                                        >
                                                            <RefreshCw className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                                {errors.code && (
                                                    <p className="text-sm text-destructive">{errors.code}</p>
                                                )}
                                                {codeManuallyEdited && !errors.code && (
                                                    <p className="text-xs text-yellow-600">
                                                        Manual edit - auto-generation disabled
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="name">Name</Label>
                                                <Input
                                                    id="name"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleNameEdit}
                                                    placeholder="e.g., Noise Complaint"
                                                    className={errors.name ? 'border-destructive' : ''}
                                                    disabled={isSubmitting}
                                                    ref={nameInputRef}
                                                />
                                                {errors.name && (
                                                    <p className="text-sm text-destructive">{errors.name}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Category and Subcategory */}
                                        <div className="grid gap-6 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="category">Category</Label>
                                                <Select
                                                    value={formData.category}
                                                    onValueChange={(value) => handleSelectChange('category', value)}
                                                    disabled={isSubmitting}
                                                >
                                                    <SelectTrigger className={errors.category ? 'border-destructive' : ''}>
                                                        <SelectValue placeholder="Select a category" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {categoryOptions.map((option) => {
                                                            const IconComponent = option.icon;
                                                            return (
                                                                <SelectItem key={option.value} value={option.value}>
                                                                    <div className="flex items-center gap-2">
                                                                        <IconComponent className="h-4 w-4" />
                                                                        <div>
                                                                            <div>{option.label}</div>
                                                                            <div className="text-xs text-muted-foreground">
                                                                                {option.description}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </SelectItem>
                                                            );
                                                        })}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="subcategory">Subcategory (Optional)</Label>
                                                <Input
                                                    id="subcategory"
                                                    name="subcategory"
                                                    value={formData.subcategory}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g., neighbor, animals, parking"
                                                    disabled={isSubmitting}
                                                />
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <div className="space-y-2">
                                            <Label htmlFor="description">Description</Label>
                                            <Textarea
                                                id="description"
                                                name="description"
                                                value={formData.description}
                                                onChange={handleInputChange}
                                                placeholder="Enter a description for this report type"
                                                rows={4}
                                                disabled={isSubmitting}
                                            />
                                        </div>

                                        {/* Icon and Color */}
                                        <div className="grid gap-6 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="icon">Icon</Label>
                                                <div className="relative">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        className="w-full justify-start gap-2 h-10"
                                                        onClick={() => setShowIconPicker(!showIconPicker)}
                                                    >
                                                        {selectedIcon && (
                                                            <>
                                                                {iconOptions.find(i => i.value === selectedIcon)?.icon && (
                                                                    <>
                                                                        {React.createElement(
                                                                            iconOptions.find(i => i.value === selectedIcon)!.icon,
                                                                            { className: "h-4 w-4" }
                                                                        )}
                                                                    </>
                                                                )}
                                                                <span className="flex-1 text-left">
                                                                    {iconOptions.find(i => i.value === selectedIcon)?.label || 'Select an icon'}
                                                                </span>
                                                            </>
                                                        )}
                                                        <ChevronDown className="h-4 w-4 opacity-50" />
                                                    </Button>

                                                    {showIconPicker && (
                                                        <Card className="absolute z-50 mt-1 w-full max-h-[400px] overflow-hidden">
                                                            <div className="p-2 border-b">
                                                                <Input
                                                                    placeholder="Search icons..."
                                                                    value={searchIconTerm}
                                                                    onChange={(e) => setSearchIconTerm(e.target.value)}
                                                                    className="h-8"
                                                                />
                                                            </div>
                                                            <ScrollArea className="h-[300px]">
                                                                <div className="p-2 grid grid-cols-4 gap-1">
                                                                    {filteredIcons.map((icon) => (
                                                                        <Button
                                                                            key={icon.value}
                                                                            type="button"
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className={`h-auto py-2 flex-col gap-1 ${
                                                                                selectedIcon === icon.value ? 'bg-primary/10 border-primary' : ''
                                                                            }`}
                                                                            onClick={() => {
                                                                                handleSelectChange('icon', icon.value);
                                                                                setSelectedIcon(icon.value);
                                                                                setShowIconPicker(false);
                                                                                setSearchIconTerm('');
                                                                            }}
                                                                        >
                                                                            <icon.icon className="h-5 w-5" />
                                                                            <span className="text-[10px] text-center line-clamp-2">
                                                                                {icon.label}
                                                                            </span>
                                                                        </Button>
                                                                    ))}
                                                                </div>
                                                            </ScrollArea>
                                                        </Card>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="color">Color</Label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        id="color"
                                                        name="color"
                                                        type="color"
                                                        value={formData.color}
                                                        onChange={handleInputChange}
                                                        className="w-20 h-10 p-1"
                                                        disabled={isSubmitting}
                                                    />
                                                    <div className="flex-1 grid grid-cols-6 gap-1">
                                                        {colorPresets.map((preset) => (
                                                            <Tooltip key={preset.value}>
                                                                <TooltipTrigger asChild>
                                                                    <button
                                                                        type="button"
                                                                        className="w-8 h-8 rounded-full border-2 transition-all hover:scale-110"
                                                                        style={{ 
                                                                            backgroundColor: preset.value,
                                                                            borderColor: formData.color === preset.value ? '#000' : 'transparent'
                                                                        }}
                                                                        onClick={() => handleSelectChange('color', preset.value)}
                                                                        disabled={isSubmitting}
                                                                    />
                                                                </TooltipTrigger>
                                                                <TooltipContent side="bottom">
                                                                    <p>{preset.name}</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Priority and Resolution */}
                                        <div className="grid gap-6 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="priority_level">Priority Level</Label>
                                                <Select
                                                    value={formData.priority_level.toString()}
                                                    onValueChange={(value) => handleNumberChange('priority_level', value)}
                                                    disabled={isSubmitting}
                                                >
                                                    <SelectTrigger className={errors.priority_level ? 'border-destructive' : ''}>
                                                        <SelectValue placeholder="Select priority level" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {Object.entries(priorityOptions).map(([value, label]) => (
                                                            <SelectItem key={value} value={value}>
                                                                <div className="flex items-center gap-2">
                                                                    {value === '1' && <Zap className="h-4 w-4 text-red-500" />}
                                                                    {value === '2' && <AlertTriangle className="h-4 w-4 text-orange-500" />}
                                                                    {value === '3' && <Clock className="h-4 w-4 text-yellow-500" />}
                                                                    {value === '4' && <Target className="h-4 w-4 text-green-500" />}
                                                                    {label}
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.priority_level && (
                                                    <p className="text-sm text-destructive">{errors.priority_level}</p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="resolution_days">Resolution Days</Label>
                                                <Input
                                                    id="resolution_days"
                                                    name="resolution_days"
                                                    type="number"
                                                    min="1"
                                                    max="365"
                                                    value={formData.resolution_days}
                                                    onChange={(e) => handleNumberChange('resolution_days', e.target.value)}
                                                    className={errors.resolution_days ? 'border-destructive' : ''}
                                                    disabled={isSubmitting}
                                                />
                                                {errors.resolution_days && (
                                                    <p className="text-sm text-destructive">{errors.resolution_days}</p>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Required Fields Tab */}
                            <TabsContent value="fields" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle>Required Fields</CardTitle>
                                                <CardDescription>
                                                    Configure the fields required for this report type
                                                </CardDescription>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setNewField({
                                                        key: '',
                                                        label: '',
                                                        type: 'text',
                                                        required: true,
                                                        placeholder: '',
                                                        options: [],
                                                    });
                                                    setEditingFieldIndex(null);
                                                    setShowCustomFieldForm(true);
                                                }}
                                                disabled={isSubmitting}
                                            >
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add Field
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Custom Field Form */}
                                        {showCustomFieldForm && (
                                            <Card className="border border-primary/20 bg-primary/5">
                                                <CardContent className="pt-6 space-y-4">
                                                    <div className="grid gap-4 md:grid-cols-2">
                                                        <div className="space-y-2">
                                                            <Label htmlFor="field_key">Field Key *</Label>
                                                            <Input
                                                                id="field_key"
                                                                value={newField.key}
                                                                onChange={(e) => setNewField({ ...newField, key: e.target.value })}
                                                                placeholder="e.g., complainant_name"
                                                                disabled={isSubmitting}
                                                            />
                                                            <p className="text-xs text-muted-foreground">
                                                                Unique identifier (lowercase, underscores)
                                                            </p>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor="field_label">Field Label *</Label>
                                                            <Input
                                                                id="field_label"
                                                                value={newField.label}
                                                                onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                                                                placeholder="e.g., Full Name"
                                                                disabled={isSubmitting}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="grid gap-4 md:grid-cols-2">
                                                        <div className="space-y-2">
                                                            <Label htmlFor="field_type">Field Type</Label>
                                                            <Select
                                                                value={newField.type}
                                                                onValueChange={(value) => setNewField({ ...newField, type: value })}
                                                                disabled={isSubmitting}
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select field type" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {Object.entries(fieldTypes).map(([value, label]) => (
                                                                        <SelectItem key={value} value={value}>
                                                                            {label}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label htmlFor="field_placeholder">Placeholder (Optional)</Label>
                                                            <Input
                                                                id="field_placeholder"
                                                                value={newField.placeholder || ''}
                                                                onChange={(e) => setNewField({ ...newField, placeholder: e.target.value })}
                                                                placeholder="Enter placeholder text"
                                                                disabled={isSubmitting}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Options for select/radio fields */}
                                                    {(newField.type === 'select' || newField.type === 'radio') && (
                                                        <div className="space-y-2">
                                                            <Label>Options</Label>
                                                            <div className="flex gap-2">
                                                                <Input
                                                                    value={newOption}
                                                                    onChange={(e) => setNewOption(e.target.value)}
                                                                    placeholder="Add an option"
                                                                    disabled={isSubmitting}
                                                                />
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={addOption}
                                                                    disabled={!newOption.trim() || isSubmitting}
                                                                >
                                                                    Add
                                                                </Button>
                                                            </div>
                                                            {newField.options && newField.options.length > 0 && (
                                                                <div className="flex flex-wrap gap-2 mt-2">
                                                                    {newField.options.map((opt, idx) => (
                                                                        <Badge key={idx} variant="secondary" className="gap-1">
                                                                            {opt}
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => removeOption(idx)}
                                                                                className="ml-1 hover:text-destructive"
                                                                            >
                                                                                <X className="h-3 w-3" />
                                                                            </button>
                                                                        </Badge>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Rows for textarea */}
                                                    {newField.type === 'textarea' && (
                                                        <div className="space-y-2">
                                                            <Label htmlFor="field_rows">Rows</Label>
                                                            <Input
                                                                id="field_rows"
                                                                type="number"
                                                                min="1"
                                                                max="10"
                                                                value={newField.rows || 4}
                                                                onChange={(e) => setNewField({ ...newField, rows: parseInt(e.target.value) || 4 })}
                                                                disabled={isSubmitting}
                                                            />
                                                        </div>
                                                    )}

                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <Switch
                                                                checked={newField.required}
                                                                onCheckedChange={(checked) => setNewField({ ...newField, required: checked })}
                                                                disabled={isSubmitting}
                                                            />
                                                            <Label>Required field</Label>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => {
                                                                    setShowCustomFieldForm(false);
                                                                    setEditingFieldIndex(null);
                                                                }}
                                                                disabled={isSubmitting}
                                                            >
                                                                Cancel
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                variant="default"
                                                                size="sm"
                                                                onClick={editingFieldIndex !== null ? updateRequiredField : addRequiredField}
                                                                disabled={isSubmitting}
                                                            >
                                                                {editingFieldIndex !== null ? 'Update' : 'Add'} Field
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )}

                                        {/* Fields List */}
                                        {formData.required_fields.length > 0 ? (
                                            <div className="space-y-2">
                                                {formData.required_fields.map((field, index) => (
                                                    <Card key={index} className="border border-muted hover:border-primary/20 transition-colors">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2 flex-wrap">
                                                                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                                                                        <span className="font-medium">{field.label}</span>
                                                                        {field.required && (
                                                                            <Badge variant="destructive" className="text-xs">Required</Badge>
                                                                        )}
                                                                        <Badge variant="outline" className="text-xs">
                                                                            {field.type}
                                                                        </Badge>
                                                                    </div>
                                                                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground ml-6">
                                                                        <code className="px-1 py-0.5 bg-muted rounded">
                                                                            {field.key}
                                                                        </code>
                                                                        {field.placeholder && (
                                                                            <>
                                                                                <span>•</span>
                                                                                <span>"{field.placeholder}"</span>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                    {field.options && field.options.length > 0 && (
                                                                        <div className="flex flex-wrap gap-1 mt-2 ml-6">
                                                                            {field.options.map((opt, optIdx) => (
                                                                                <Badge key={optIdx} variant="secondary" className="text-xs">
                                                                                    {opt}
                                                                                </Badge>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8"
                                                                        onClick={() => moveFieldUp(index)}
                                                                        disabled={index === 0 || isSubmitting}
                                                                        title="Move up"
                                                                    >
                                                                        <ChevronUp className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8"
                                                                        onClick={() => moveFieldDown(index)}
                                                                        disabled={index === formData.required_fields.length - 1 || isSubmitting}
                                                                        title="Move down"
                                                                    >
                                                                        <ChevronDown className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8"
                                                                        onClick={() => editRequiredField(index)}
                                                                        disabled={isSubmitting}
                                                                        title="Edit field"
                                                                    >
                                                                        <Settings className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8 text-destructive hover:text-destructive"
                                                                        onClick={() => removeRequiredField(index)}
                                                                        disabled={isSubmitting}
                                                                        title="Remove field"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12 border-2 border-dashed rounded-lg">
                                                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                                                    <ListChecks className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                                                </div>
                                                <h3 className="text-lg font-semibold mb-2">No Custom Fields</h3>
                                                <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
                                                    This report type will use default fields. Add custom fields to collect specific information.
                                                </p>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setNewField({
                                                            key: '',
                                                            label: '',
                                                            type: 'text',
                                                            required: true,
                                                            placeholder: '',
                                                            options: [],
                                                        });
                                                        setShowCustomFieldForm(true);
                                                    }}
                                                >
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Add Your First Field
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Resolution Steps Tab */}
                            <TabsContent value="steps" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle>Resolution Steps</CardTitle>
                                                <CardDescription>
                                                    Define the steps to resolve this type of report
                                                </CardDescription>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={addResolutionStep}
                                                disabled={isSubmitting}
                                            >
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add Step
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {formData.resolution_steps.length > 0 ? (
                                            <div className="space-y-4">
                                                {formData.resolution_steps.map((step, index) => (
                                                    <Card key={index} className="border border-muted hover:border-primary/20 transition-colors">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-start gap-4">
                                                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                                    <span className="text-sm font-bold text-primary">{step.step}</span>
                                                                </div>
                                                                <div className="flex-1 space-y-2">
                                                                    <Input
                                                                        value={step.action}
                                                                        onChange={(e) => updateResolutionStep(index, 'action', e.target.value)}
                                                                        placeholder="Action title (e.g., 'Initial Assessment')"
                                                                        disabled={isSubmitting}
                                                                        className="font-medium"
                                                                    />
                                                                    <Textarea
                                                                        value={step.description}
                                                                        onChange={(e) => updateResolutionStep(index, 'description', e.target.value)}
                                                                        placeholder="Step description - explain what happens in this step"
                                                                        rows={2}
                                                                        disabled={isSubmitting}
                                                                    />
                                                                </div>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                                                    onClick={() => removeResolutionStep(index)}
                                                                    disabled={isSubmitting}
                                                                    title="Remove step"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12 border-2 border-dashed rounded-lg">
                                                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                                                    <Activity className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                                                </div>
                                                <h3 className="text-lg font-semibold mb-2">No Resolution Steps</h3>
                                                <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
                                                    Add steps to define how this report type should be resolved from submission to closure.
                                                </p>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={addResolutionStep}
                                                >
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Add First Step
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Settings Tab */}
                            <TabsContent value="settings" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Report Type Settings</CardTitle>
                                        <CardDescription>
                                            Configure behavior and permissions
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* Toggle Switches */}
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                                <div className="space-y-0.5">
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                                        <Label className="text-base">Active Status</Label>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">
                                                        Enable this report type for submission
                                                    </p>
                                                </div>
                                                <Switch
                                                    checked={formData.is_active}
                                                    onCheckedChange={(checked) => handleSwitchChange('is_active', checked)}
                                                    disabled={isSubmitting}
                                                />
                                            </div>

                                            <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                                <div className="space-y-0.5">
                                                    <div className="flex items-center gap-2">
                                                        <Zap className="h-5 w-5 text-orange-500" />
                                                        <Label className="text-base">Requires Immediate Action</Label>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">
                                                        Mark this report type as high priority requiring immediate response
                                                    </p>
                                                </div>
                                                <Switch
                                                    checked={formData.requires_immediate_action}
                                                    onCheckedChange={(checked) => handleSwitchChange('requires_immediate_action', checked)}
                                                    disabled={isSubmitting}
                                                />
                                            </div>

                                            <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                                <div className="space-y-0.5">
                                                    <div className="flex items-center gap-2">
                                                        <Camera className="h-5 w-5 text-blue-500" />
                                                        <Label className="text-base">Requires Evidence</Label>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">
                                                        Require photo/video evidence when submitting reports
                                                    </p>
                                                </div>
                                                <Switch
                                                    checked={formData.requires_evidence}
                                                    onCheckedChange={(checked) => handleSwitchChange('requires_evidence', checked)}
                                                    disabled={isSubmitting}
                                                />
                                            </div>

                                            <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                                <div className="space-y-0.5">
                                                    <div className="flex items-center gap-2">
                                                        <EyeOff className="h-5 w-5 text-purple-500" />
                                                        <Label className="text-base">Allows Anonymous Reports</Label>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">
                                                        Allow residents to submit reports anonymously
                                                    </p>
                                                </div>
                                                <Switch
                                                    checked={formData.allows_anonymous}
                                                    onCheckedChange={(checked) => handleSwitchChange('allows_anonymous', checked)}
                                                    disabled={isSubmitting}
                                                />
                                            </div>
                                        </div>

                                        <Separator />

                                        {/* Assigned Roles */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2">
                                                <Users className="h-5 w-5" />
                                                <Label className="text-base">Assigned Roles</Label>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                Select which personnel roles should handle this type of report
                                            </p>
                                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                                {Object.entries(roleOptions).map(([value, label]) => (
                                                    <Button
                                                        key={value}
                                                        type="button"
                                                        variant={formData.assigned_to_roles.includes(value) ? 'default' : 'outline'}
                                                        size="sm"
                                                        onClick={() => toggleRole(value)}
                                                        disabled={isSubmitting}
                                                        className="justify-start h-auto py-2 px-3"
                                                    >
                                                        <Users className="h-4 w-4 mr-2 flex-shrink-0" />
                                                        <span className="text-sm truncate">{label}</span>
                                                        {formData.assigned_to_roles.includes(value) && (
                                                            <CheckCircle className="h-4 w-4 ml-auto flex-shrink-0" />
                                                        )}
                                                    </Button>
                                                ))}
                                            </div>
                                            {formData.assigned_to_roles.length === 0 && (
                                                <p className="text-sm text-muted-foreground text-center py-4 border rounded-lg bg-muted/50">
                                                    No roles selected. This report type will use default assignment.
                                                </p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </form>

                    {/* Form Tips */}
                    <Card className="bg-muted/50">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <HelpCircle className="h-4 w-4" />
                                Form Tips
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                <div className="flex items-start gap-2">
                                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-xs font-bold text-primary">1</span>
                                    </div>
                                    <p className="text-muted-foreground">
                                        <span className="font-medium text-foreground">Code:</span> Auto-generated from name, but you can edit it manually
                                    </p>
                                </div>
                                <div className="flex items-start gap-2">
                                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-xs font-bold text-primary">2</span>
                                    </div>
                                    <p className="text-muted-foreground">
                                        <span className="font-medium text-foreground">Priority Level:</span> 1=Critical, 2=High, 3=Medium, 4=Low
                                    </p>
                                </div>
                                <div className="flex items-start gap-2">
                                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-xs font-bold text-primary">3</span>
                                    </div>
                                    <p className="text-muted-foreground">
                                        <span className="font-medium text-foreground">Required Fields:</span> Add custom fields specific to this report type
                                    </p>
                                </div>
                                <div className="flex items-start gap-2">
                                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-xs font-bold text-primary">4</span>
                                    </div>
                                    <p className="text-muted-foreground">
                                        <span className="font-medium text-foreground">Resolution Steps:</span> Define the process from submission to closure
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </TooltipProvider>
        </AppLayout>
    );
}