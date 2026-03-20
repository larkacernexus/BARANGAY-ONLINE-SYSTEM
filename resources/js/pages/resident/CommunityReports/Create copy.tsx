import { useForm, usePage, Link } from '@inertiajs/react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { route } from 'ziggy-js';
import ResidentLayout from '@/layouts/resident-app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
    ArrowLeft,
    AlertCircle,
    Upload,
    Camera,
    AlertTriangle,
    CheckCircle,
    X,
    FileText,
    Phone,
    ShieldAlert,
    ArrowRight,
    Loader2,
    Shield,
    Info,
    Clock,
    FileUp,
    Search,
    Check,
    Users,
    Zap,
    Trash2,
    Droplets,
    Wrench,
    Building,
    Megaphone,
    Bell,
    Construction,
    Car,
    PawPrint,
    HeartPulse,
    Store,
    MapPin,
    Calendar,
    Volume,
    UserX,
    Handshake,
    Save,
    Image as ImageIcon,
    Video,
    File,
    Eye,
    Send,
    HelpCircle
} from 'lucide-react';

interface FileWithPreview extends File {
    preview: string;
    id: string;
    type: string;
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
    requires_evidence: boolean;
    allows_anonymous: boolean;
    priority_label: string;
    priority_color: string;
    category: 'issue' | 'complaint';
}

interface LocalDraft {
    id: string;
    report_type_id: number | null;
    title: string;
    description: string;
    location: string;
    incident_date: string;
    incident_time: string;
    urgency: 'low' | 'medium' | 'high';
    is_anonymous: boolean;
    reporter_name: string;
    reporter_contact: string;
    files: Array<{name: string, size: number, type: string, lastModified: number}>;
    created_at: string;
    updated_at: string;
}

interface PageProps {
    reportTypes?: ReportType[];
    auth: any;
}

// Helper function to check if an object is a File
const isFile = (obj: any): obj is File => {
    return obj && 
           typeof obj === 'object' && 
           'name' in obj && 
           'size' in obj && 
           'type' in obj &&
           'lastModified' in obj;
};

// Helper to generate draft ID
const generateDraftId = () => {
    return 'draft_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

// Local storage keys
const DRAFT_KEY = 'community_report_draft';
const DRAFTS_LIST_KEY = 'community_report_drafts_list';

// Function to pair items for display
const pairItems = <T,>(items: T[]): (T | null)[][] => {
    const pairs: (T | null)[][] = [];
    
    for (let i = 0; i < items.length; i += 2) {
        const pair: (T | null)[] = [items[i], i + 1 < items.length ? items[i + 1] : null];
        pairs.push(pair);
    }
    
    return pairs;
};

// Function to organize report types with "OTHER" at the bottom
const organizeReportTypes = (types: ReportType[]) => {
    const otherIssues = types.filter(type => type.category === 'issue' && type.code === 'OTHER_ISSUE');
    const otherComplaints = types.filter(type => type.category === 'complaint' && type.code === 'OTHER_COMPLAINT');
    
    const regularIssues = types.filter(type => type.category === 'issue' && type.code !== 'OTHER_ISSUE');
    const regularComplaints = types.filter(type => type.category === 'complaint' && type.code !== 'OTHER_COMPLAINT');
    
    return {
        issues: [...regularIssues.sort((a, b) => a.name.localeCompare(b.name)), ...otherIssues],
        complaints: [...regularComplaints.sort((a, b) => a.name.localeCompare(b.name)), ...otherComplaints]
    };
};

export default function CommunityReport() {
    const { reportTypes = [], auth = {} } = usePage<PageProps>().props;
    
    // Safeguard all data access
    const safeReportTypes = Array.isArray(reportTypes) ? reportTypes : [];
    const safeUser = auth?.user || {};
    
    const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
    const [anonymous, setAnonymous] = useState(false);
    const [files, setFiles] = useState<FileWithPreview[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSavingDraft, setIsSavingDraft] = useState(false);
    const [activeStep, setActiveStep] = useState(1);
    const [showEmergencyModal, setShowEmergencyModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
    const [existingFiles, setExistingFiles] = useState<Array<{name: string, size: number, type: string, lastModified: number, preview?: string}>>([]);
    const [previewModal, setPreviewModal] = useState<{isOpen: boolean, url: string, type: string, name: string}>({
        isOpen: false,
        url: '',
        type: '',
        name: ''
    });
    const [activeTab, setActiveTab] = useState<'issues' | 'complaints'>('issues');
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Mobile state
    const [isMobile, setIsMobile] = useState(false);
    const [isButtonsVisible, setIsButtonsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    
    // Form data
    const today = new Date().toISOString().split('T')[0];
    const { data, setData, post, processing, errors, reset } = useForm({
        report_type_id: null as number | null,
        title: '',
        description: '',
        location: '',
        incident_date: today,
        incident_time: '',
        urgency: 'medium' as 'low' | 'medium' | 'high',
        is_anonymous: false,
        reporter_name: safeUser.name || '',
        reporter_contact: safeUser.phone || safeUser.email || '',
        evidence: [] as File[],
        _method: 'post' as 'post' | 'put'
    });

    // Active report types and selected type
    const activeReportTypes = safeReportTypes.filter((type: ReportType) => type.is_active);
    const selectedType = activeReportTypes.find((type: ReportType) => type.id === data.report_type_id);

    // Icon mapping with HelpCircle for "Other" types
    const iconMap: Record<string, React.ComponentType<any>> = {
        'alert-circle': AlertCircle,
        'megaphone': Megaphone,
        'volume-2': Volume,
        'gavel': FileText,
        'users': Users,
        'zap': Zap,
        'trash-2': Trash2,
        'droplets': Droplets,
        'wrench': Wrench,
        'building': Building,
        'bell': Bell,
        'construction': Construction,
        'car': Car,
        'paw-print': PawPrint,
        'heart-pulse': HeartPulse,
        'store': Store,
        'volume': Volume,
        'user-x': UserX,
        'handshake': Handshake,
        'help-circle': HelpCircle,
        'default': AlertCircle
    };

    // Steps
    const steps = [
        { id: 1, title: 'Type', description: 'Select report type', icon: AlertCircle },
        { id: 2, title: 'Details', description: 'Provide information', icon: FileText },
        { id: 3, title: 'Evidence', description: 'Add photos/files', icon: Camera },
        { id: 4, title: 'Review', description: 'Final check', icon: CheckCircle }
    ];
    
    // Organize report types with "OTHER" at the bottom
    const organizedTypes = organizeReportTypes(activeReportTypes);
    
    // Check if mobile on mount and resize
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        return () => {
            window.removeEventListener('resize', checkMobile);
        };
    }, []);

    // Load draft from localStorage on component mount
    useEffect(() => {
        const loadDraft = () => {
            try {
                const savedDraft = localStorage.getItem(DRAFT_KEY);
                if (savedDraft) {
                    const draft: LocalDraft = JSON.parse(savedDraft);
                    
                    // Only load if draft is from today
                    const draftDate = new Date(draft.created_at);
                    const today = new Date();
                    const isSameDay = draftDate.getDate() === today.getDate() && 
                                     draftDate.getMonth() === today.getMonth() && 
                                     draftDate.getFullYear() === today.getFullYear();
                    
                    if (isSameDay) {
                        // Set form data from draft
                        setData({
                            report_type_id: draft.report_type_id,
                            title: draft.title,
                            description: draft.description,
                            location: draft.location,
                            incident_date: draft.incident_date,
                            incident_time: draft.incident_time,
                            urgency: draft.urgency,
                            is_anonymous: draft.is_anonymous,
                            reporter_name: draft.reporter_name,
                            reporter_contact: draft.reporter_contact,
                            evidence: [],
                            _method: 'post'
                        });
                        
                        setSelectedTypeId(draft.report_type_id);
                        setAnonymous(draft.is_anonymous);
                        setCurrentDraftId(draft.id);
                        setExistingFiles(draft.files || []);
                        
                        toast.info('Draft loaded from previous session', {
                            duration: 3000,
                            action: {
                                label: 'Clear',
                                onClick: () => clearDraft()
                            }
                        });
                    } else {
                        clearDraft();
                    }
                }
            } catch (error) {
                console.error('Error loading draft from localStorage:', error);
                clearDraft();
            }
        };

        loadDraft();
        
        // Auto-save on unload
        const handleBeforeUnload = () => {
            if (hasUnsavedChanges()) {
                saveDraft();
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

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

    // Check if there are unsaved changes
    const hasUnsavedChanges = () => {
        return data.report_type_id || 
               data.title.trim() || 
               data.description.trim() || 
               data.location.trim() || 
               files.length > 0 ||
               existingFiles.length > 0;
    };

    // Clear draft from localStorage
    const clearDraft = () => {
        localStorage.removeItem(DRAFT_KEY);
        setCurrentDraftId(null);
        setExistingFiles([]);
        toast.success('Draft cleared');
    };

    // Get draft list from localStorage
    const getDraftList = (): LocalDraft[] => {
        try {
            const drafts = localStorage.getItem(DRAFTS_LIST_KEY);
            return drafts ? JSON.parse(drafts) : [];
        } catch (error) {
            return [];
        }
    };

    // Save draft list to localStorage
    const saveDraftList = (drafts: LocalDraft[]) => {
        try {
            localStorage.setItem(DRAFTS_LIST_KEY, JSON.stringify(drafts));
        } catch (error) {
            console.error('Error saving draft list to localStorage:', error);
        }
    };

    // Navigation
    const nextStep = () => {
        if (activeStep === 1 && !data.report_type_id) {
            toast.error('Please select a report type');
            return;
        }
        
        if (activeStep === 2) {
            if (!data.title.trim() || !data.description.trim() || !data.location.trim() || !data.incident_date) {
                toast.error('Please fill in all required fields');
                return;
            }
        }
        
        if (activeStep === 3 && selectedType?.requires_evidence && 
            (!Array.isArray(data.evidence) || data.evidence.length === 0) && 
            existingFiles.length === 0) {
            toast.error('Evidence is required for this type of report');
            return;
        }
        
        if (activeStep < 4) {
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

    // File handling
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);
        
        if (selectedFiles.length + files.length > 10) {
            toast.error('Maximum 10 files allowed');
            return;
        }
        
        const validFiles = selectedFiles.filter(file => {
            const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'video/mp4', 'video/mov', 'video/avi'];
            const maxSize = 5 * 1024 * 1024;
            
            if (!validTypes.includes(file.type)) {
                toast.error(`Invalid file type: ${file.name}. Use JPG, PNG, GIF, WebP, PDF, MP4, MOV, or AVI.`);
                return false;
            }
            
            if (file.size > maxSize) {
                toast.error(`File too large (max 5MB): ${file.name}`);
                return false;
            }
            
            return true;
        });

        const newFiles = validFiles.map(file => ({
            ...file,
            preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : '',
            id: Math.random().toString(36).substr(2, 9),
            type: file.type
        })) as FileWithPreview[];

        setFiles(prev => [...prev, ...newFiles]);
        
        const currentEvidence = Array.isArray(data.evidence) ? data.evidence : [];
        const updatedEvidence = [...currentEvidence, ...validFiles];
        setData('evidence', updatedEvidence);
        
        if (validFiles.length > 0) {
            toast.success(`Added ${validFiles.length} file(s)`);
        }
        
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removeFile = (id: string) => {
        setFiles(prev => {
            const newFiles = prev.filter(file => file && file.id !== id);
            const removedFile = prev.find(file => file && file.id === id);
            
            if (removedFile?.preview) {
                URL.revokeObjectURL(removedFile.preview);
            }
            
            return newFiles;
        });

        const fileToRemove = files.find(f => f && f.id === id);
        if (fileToRemove) {
            const fileIndex = files.findIndex(f => f && f.id === id);
            const currentEvidence = Array.isArray(data.evidence) ? data.evidence : [];
            const updatedEvidence = currentEvidence.filter((_, i) => i !== fileIndex);
            setData('evidence', updatedEvidence);
        }
        
        toast.info('File removed');
    };

    const removeExistingFile = (index: number) => {
        const updatedFiles = [...existingFiles];
        updatedFiles.splice(index, 1);
        setExistingFiles(updatedFiles);
        toast.info('File removed from draft');
    };

    // Open preview modal
    const openPreview = (url: string, type: string, name: string) => {
        setPreviewModal({
            isOpen: true,
            url,
            type,
            name
        });
    };

    // Close preview modal
    const closePreview = () => {
        setPreviewModal({
            isOpen: false,
            url: '',
            type: '',
            name: ''
        });
    };

    // Get file icon based on type
    const getFileIcon = (type: string) => {
        if (type.startsWith('image/')) return ImageIcon;
        if (type.startsWith('video/')) return Video;
        if (type === 'application/pdf') return FileText;
        return File;
    };

    // Format file size
    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    // SAVE DRAFT TO LOCALSTORAGE
    const saveDraft = () => {
        try {
            const draftId = currentDraftId || generateDraftId();
            const now = new Date().toISOString();
            
            const draft: LocalDraft = {
                id: draftId,
                report_type_id: data.report_type_id,
                title: data.title,
                description: data.description,
                location: data.location,
                incident_date: data.incident_date,
                incident_time: data.incident_time,
                urgency: data.urgency,
                is_anonymous: anonymous,
                reporter_name: anonymous ? '' : data.reporter_name,
                reporter_contact: anonymous ? '' : data.reporter_contact,
                files: existingFiles.map(file => ({
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    lastModified: file.lastModified
                })),
                created_at: currentDraftId ? (() => {
                    try {
                        const existing = localStorage.getItem(DRAFT_KEY);
                        if (existing) {
                            const existingDraft = JSON.parse(existing);
                            return existingDraft.created_at || now;
                        }
                    } catch (e) {}
                    return now;
                })() : now,
                updated_at: now
            };
            
            localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
            
            const draftList = getDraftList();
            const existingIndex = draftList.findIndex(d => d.id === draftId);
            if (existingIndex >= 0) {
                draftList[existingIndex] = draft;
            } else {
                draftList.push(draft);
            }
            saveDraftList(draftList);
            
            setCurrentDraftId(draftId);
        } catch (error) {
            console.error('Error saving draft to localStorage:', error);
        }
    };

    // Handle manual save draft
    const handleSaveDraft = async () => {
        if (isSavingDraft || isSubmitting || processing) return;
        
        try {
            setIsSavingDraft(true);
            saveDraft();
            toast.success('Draft saved locally');
        } catch (error) {
            toast.error('Failed to save draft locally');
        } finally {
            setIsSavingDraft(false);
        }
    };

    // Form submission
    const handleSubmit = async () => {
        if (isSubmitting || processing) {
            return;
        }
        
        // Final validation
        if (!data.report_type_id) {
            toast.error('Please select a report type');
            setActiveStep(1);
            return;
        }
        
        if (!data.title.trim() || !data.description.trim() || !data.location.trim() || !data.incident_date) {
            toast.error('Please fill in all required fields');
            setActiveStep(2);
            return;
        }
        
        if (selectedType?.requires_evidence && 
            (!Array.isArray(data.evidence) || data.evidence.length === 0) && 
            existingFiles.length === 0) {
            toast.error('Evidence is required for this type of report');
            setActiveStep(3);
            return;
        }
        
        if (!anonymous && !data.reporter_contact?.trim()) {
            toast.error('Please provide your contact information');
            return;
        }
        
        try {
            setIsSubmitting(true);
            
            const formData = new FormData();
            
            formData.append('report_type_id', String(data.report_type_id));
            formData.append('title', data.title);
            formData.append('description', data.description);
            formData.append('detailed_description', data.description);
            formData.append('location', data.location);
            formData.append('incident_date', data.incident_date);
            formData.append('incident_time', data.incident_time || '');
            formData.append('urgency_level', data.urgency);
            formData.append('recurring_issue', '0');
            formData.append('affected_people', 'individual');
            formData.append('estimated_affected_count', '1');
            formData.append('is_anonymous', anonymous ? '1' : '0');
            formData.append('has_previous_report', '0');
            formData.append('impact_level', 'moderate');
            formData.append('safety_concern', '0');
            formData.append('environmental_impact', '0');
            formData.append('status', 'pending');
            formData.append('priority', 'medium');
            
            if (!anonymous) {
                formData.append('reporter_name', data.reporter_name || '');
                formData.append('reporter_contact', data.reporter_contact || '');
            }
            
            const evidenceFiles = Array.isArray(data.evidence) ? data.evidence : [];
            if (evidenceFiles.length > 0) {
                evidenceFiles.forEach((file, index) => {
                    if (isFile(file)) {
                        formData.append('evidence[]', file);
                    }
                });
            }
            
            const routeUrl = route('resident.community-reports.store');
            
            await post(routeUrl, formData, {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    toast.success(anonymous 
                        ? 'Anonymous report submitted successfully!' 
                        : 'Report submitted successfully!'
                    );
                    
                    // Clean up
                    files.forEach(file => {
                        if (file?.preview) {
                            URL.revokeObjectURL(file.preview);
                        }
                    });
                    
                    clearDraft();
                    
                    if (currentDraftId) {
                        const draftList = getDraftList();
                        const updatedList = draftList.filter(d => d.id !== currentDraftId);
                        saveDraftList(updatedList);
                    }
                    
                    reset();
                    setFiles([]);
                    setExistingFiles([]);
                    setSelectedTypeId(null);
                    setAnonymous(false);
                    setCurrentDraftId(null);
                    setActiveStep(1);
                },
                onError: (errors) => {
                    if (errors) {
                        Object.entries(errors).forEach(([field, message]) => {
                            toast.error(`${field}: ${message}`);
                        });
                    } else {
                        toast.error('An error occurred while submitting the report');
                    }
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

    // DELETE DRAFT FROM LOCALSTORAGE
    const handleDeleteDraft = () => {
        if (!currentDraftId) return;
        
        if (confirm('Are you sure you want to delete this draft? This cannot be undone.')) {
            clearDraft();
            
            const draftList = getDraftList();
            const updatedList = draftList.filter(d => d.id !== currentDraftId);
            saveDraftList(updatedList);
            
            reset();
            setFiles([]);
            setData('evidence', []);
            setSelectedTypeId(null);
            setAnonymous(false);
            setActiveStep(1);
            
            toast.success('Draft deleted successfully');
        }
    };

    // Handle type selection
    const handleTypeSelect = (typeId: number) => {
        setSelectedTypeId(typeId);
        setData('report_type_id', typeId);
        
        const selected = activeReportTypes.find(t => t.id === typeId);
        if (selected && isMobile) {
            setTimeout(() => {
                nextStep();
            }, 100);
        }
    };

    // Handle anonymous toggle
    const handleAnonymousToggle = (checked: boolean) => {
        if (selectedType && !selectedType.allows_anonymous) {
            toast.error('This report type does not allow anonymous reporting');
            return;
        }
        
        setAnonymous(checked);
        setData('is_anonymous', checked);
        
        if (checked) {
            toast.info('Your report will be submitted anonymously.');
        }
    };

    // Check if item is an "Other" type
    const isOtherType = (type: ReportType) => {
        return type.code === 'OTHER_ISSUE' || type.code === 'OTHER_COMPLAINT';
    };

    // Filtered report types based on search query
    const getFilteredTypes = () => {
        if (!searchQuery) return organizedTypes;
        
        const filteredIssues = organizedTypes.issues.filter(type => 
            type.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            type.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            type.code.toLowerCase().includes(searchQuery.toLowerCase())
        );
        
        const filteredComplaints = organizedTypes.complaints.filter(type => 
            type.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            type.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            type.code.toLowerCase().includes(searchQuery.toLowerCase())
        );
        
        return {
            issues: filteredIssues,
            complaints: filteredComplaints
        };
    };

    const filteredTypes = getFilteredTypes();

    // Determine which items to show based on active tab
    const tabItems = activeTab === 'issues' ? filteredTypes.issues : filteredTypes.complaints;
    const pairedItems = pairItems(tabItems);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            files.forEach(file => {
                if (file?.preview) {
                    URL.revokeObjectURL(file.preview);
                }
            });
        };
    }, [files]);

    // Auto-save on changes
    useEffect(() => {
        if (hasUnsavedChanges()) {
            saveDraft();
        }
    }, [data, files, existingFiles, anonymous, activeStep]);

    return (
        <ResidentLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/resident/dashboard' },
                { title: 'My Reports', href: '/resident/community-reports' },
                { title: 'Submit Report', href: '#' }
            ]}
        >
            <div className="space-y-4 md:space-y-6">
                <form id="report-form" className="space-y-6">
                    {/* Mobile Header with Progress */}
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
                                        <div className="flex items-center justify-between">
                                            <h1 className="text-lg font-bold truncate">Submit Report</h1>
                                            {currentDraftId && (
                                                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                                    Draft Saved
                                                </Badge>
                                            )}
                                        </div>
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
                                    <Link href="/resident/community-reports">
                                        <Button variant="ghost" size="sm" className="gap-2">
                                            <ArrowLeft className="h-4 w-4" />
                                            Back
                                        </Button>
                                    </Link>
                                    <div className="flex items-center gap-3">
                                        <div>
                                            <h1 className="text-3xl font-bold tracking-tight">Submit Report</h1>
                                            <p className="text-gray-500 dark:text-gray-400 mt-1">
                                                Report issues or file complaints to help improve our community
                                            </p>
                                        </div>
                                        {currentDraftId && (
                                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                Draft Auto-saved
                                            </Badge>
                                        )}
                                    </div>
                                </div>
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
                    )}

                    {/* Error Display */}
                    {Object.keys(errors).length > 0 && (
                        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 mb-6 mx-4 lg:mx-0">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-semibold text-red-700 mb-1">Please fix the following errors:</h4>
                                    <ul className="list-disc list-inside space-y-1 text-sm text-red-600">
                                        {Object.entries(errors).map(([field, message]) => (
                                            <li key={field}>{message}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="px-4 md:px-6 pb-24 md:pb-6">
                        {/* Step Navigation for Mobile */}
                        {isMobile && (
                            <div className="flex justify-between mb-6 overflow-x-auto py-2">
                                {steps.map((step) => {
                                    const Icon = step.icon;
                                    return (
                                        <button
                                            key={step.id}
                                            type="button"
                                            className={`flex flex-col items-center px-3 py-2 rounded-lg transition-colors ${
                                                activeStep === step.id 
                                                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                                                    : 'text-gray-500 dark:text-gray-400'
                                            }`}
                                            onClick={() => setActiveStep(step.id)}
                                        >
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-1 ${
                                                activeStep === step.id 
                                                    ? 'bg-blue-600 text-white' 
                                                    : 'bg-gray-200 dark:bg-gray-900'
                                            }`}>
                                                {step.id}
                                            </div>
                                            <span className="text-xs font-medium whitespace-nowrap">{step.title}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Desktop Step Progress Bar */}
                        {!isMobile && (
                            <div className="mb-8">
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <h2 className="text-2xl font-bold">
                                            Step {activeStep}: {steps[activeStep - 1].title}
                                        </h2>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            {steps[activeStep - 1].description}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                            Step {activeStep} of {steps.length}
                                        </Badge>
                                    </div>
                                </div>
                                <Progress value={(activeStep / steps.length) * 100} className="h-2" />
                            </div>
                        )}

                        {/* STEP 1: Report Type Selection */}
                        {activeStep === 1 && (
                            <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
                                <div className="lg:col-span-2 space-y-6">
                                    {/* Search bar */}
                                    {activeReportTypes.length > 8 && (
                                        <div className="mb-4">
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
                                            {filteredTypes.issues.length === 0 && filteredTypes.complaints.length === 0 && (
                                                <div className="text-center py-6 text-gray-500">
                                                    No report types found matching "{searchQuery}"
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Tab Navigation */}
                                    <div className="mb-4">
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
                                                        <span>Issues</span>
                                                        <Badge 
                                                            variant="secondary" 
                                                            className="h-5 min-w-5 flex items-center justify-center px-1 text-xs"
                                                        >
                                                            {filteredTypes.issues.length}
                                                        </Badge>
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
                                                        <Badge 
                                                            variant="secondary" 
                                                            className="h-5 min-w-5 flex items-center justify-center px-1 text-xs"
                                                        >
                                                            {filteredTypes.complaints.length}
                                                        </Badge>
                                                    </div>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Report type list - DISPLAYED IN PAIRS */}
                                    <div className={`${isMobile && tabItems.length > 6 ? 'max-h-[400px] overflow-y-auto pr-2' : ''}`}>
                                        <div className="space-y-3">
                                            {pairedItems.length > 0 ? (
                                                <>
                                                    {/* Regular report types */}
                                                    {pairedItems.filter(pair => 
                                                        pair.some(type => type && !isOtherType(type))
                                                    ).map((pair, pairIndex) => (
                                                        <div key={`regular-${pairIndex}`} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            {pair.map((type, itemIndex) => {
                                                                if (!type || isOtherType(type)) return null;
                                                                
                                                                const Icon = iconMap[type.icon] || iconMap.default;
                                                                const isSelected = data.report_type_id === type.id;
                                                                
                                                                return (
                                                                    <button
                                                                        key={type.id}
                                                                        type="button"
                                                                        className={`w-full text-left p-4 rounded-lg border transition-all ${
                                                                            isSelected
                                                                                ? `border-blue-500 bg-gradient-to-r ${
                                                                                    activeTab === 'issues' 
                                                                                        ? 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20' 
                                                                                        : 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20'
                                                                                } ring-2 ring-blue-500/20`
                                                                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900/50'
                                                                        }`}
                                                                        onClick={() => handleTypeSelect(type.id)}
                                                                    >
                                                                        <div className="flex items-start justify-between">
                                                                            <div className="flex items-start gap-3 min-w-0 flex-1">
                                                                                <div className={`p-2.5 rounded-lg flex-shrink-0 mt-0.5 ${
                                                                                    isSelected 
                                                                                        ? (activeTab === 'issues' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-purple-100 dark:bg-purple-900/30')
                                                                                        : 'bg-gray-100 dark:bg-gray-900'
                                                                                }`}>
                                                                                    <Icon className={`h-5 w-5 ${
                                                                                        isSelected 
                                                                                            ? (activeTab === 'issues' ? 'text-blue-600 dark:text-blue-400' : 'text-purple-600 dark:text-purple-400')
                                                                                            : 'text-gray-600 dark:text-gray-400'
                                                                                    }`} />
                                                                                </div>
                                                                                <div className="min-w-0 flex-1">
                                                                                    <div className="flex items-center gap-2 mb-2">
                                                                                        <h3 className="font-semibold text-sm truncate">
                                                                                            {type.name}
                                                                                        </h3>
                                                                                        <Badge 
                                                                                            style={{ backgroundColor: type.priority_color }}
                                                                                            className="text-xs flex-shrink-0 h-5 px-1.5"
                                                                                        >
                                                                                            {type.priority_label}
                                                                                        </Badge>
                                                                                    </div>
                                                                                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
                                                                                        {type.description}
                                                                                    </p>
                                                                                    {/* Compact metadata */}
                                                                                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                                                                        <div className="flex items-center gap-1">
                                                                                            <Clock className="h-3 w-3" />
                                                                                            <span>{type.resolution_days}d</span>
                                                                                        </div>
                                                                                        <div className="flex items-center gap-1">
                                                                                            {type.requires_evidence ? (
                                                                                                <Camera className="h-3 w-3 text-amber-600" />
                                                                                            ) : (
                                                                                                <FileText className="h-3 w-3 text-gray-400" />
                                                                                            )}
                                                                                            <span>{type.requires_evidence ? 'Evidence' : 'Optional'}</span>
                                                                                        </div>
                                                                                        <div className="flex items-center gap-1">
                                                                                            {type.allows_anonymous ? (
                                                                                                <Shield className="h-3 w-3 text-green-600" />
                                                                                            ) : (
                                                                                                <UserX className="h-3 w-3 text-gray-400" />
                                                                                            )}
                                                                                            <span>{type.allows_anonymous ? 'Anon' : 'ID'}</span>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex-shrink-0 ml-2">
                                                                                {isSelected ? (
                                                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                                                                        activeTab === 'issues' ? 'bg-blue-600' : 'bg-purple-600'
                                                                                    }`}>
                                                                                        <Check className="h-3.5 w-3.5 text-white" />
                                                                                    </div>
                                                                                ) : (
                                                                                    <ArrowRight className="h-4 w-4 text-gray-400" />
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </button>
                                                                );
                                                            })}
                                                            {/* Fill empty slots in pair */}
                                                            {pair.filter(type => type && !isOtherType(type)).length < 2 && (
                                                                <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 min-h-[120px] bg-gray-50/50 dark:bg-gray-900/30 flex items-center justify-center">
                                                                    <div className="text-center text-gray-400 dark:text-gray-500">
                                                                        <div className="text-sm">No more items</div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}

                                                    {/* "Other" report type - always at the bottom */}
                                                    {pairedItems.filter(pair => 
                                                        pair.some(type => type && isOtherType(type))
                                                    ).map((pair, pairIndex) => (
                                                        <div key={`other-${pairIndex}`} className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-700">
                                                            <div className="mb-2">
                                                                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                    <HelpCircle className="h-4 w-4 inline mr-2 text-gray-500" />
                                                                    Can't find what you're looking for?
                                                                </h3>
                                                            </div>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                {pair.map((type, itemIndex) => {
                                                                    if (!type || !isOtherType(type)) return null;
                                                                    
                                                                    const Icon = HelpCircle; // Always use HelpCircle for "Other" types
                                                                    const isSelected = data.report_type_id === type.id;
                                                                    
                                                                    return (
                                                                        <button
                                                                            key={type.id}
                                                                            type="button"
                                                                            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                                                                                isSelected
                                                                                    ? `border-amber-500 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 ring-2 ring-amber-500/20`
                                                                                    : 'border-gray-300 dark:border-gray-600 hover:border-amber-400 dark:hover:border-amber-600 hover:bg-amber-50/50 dark:hover:bg-amber-900/10'
                                                                            }`}
                                                                            onClick={() => handleTypeSelect(type.id)}
                                                                        >
                                                                            <div className="flex items-start justify-between">
                                                                                <div className="flex items-start gap-3 min-w-0 flex-1">
                                                                                    <div className={`p-2.5 rounded-lg flex-shrink-0 mt-0.5 ${
                                                                                        isSelected 
                                                                                            ? 'bg-amber-100 dark:bg-amber-900/30'
                                                                                            : 'bg-gray-100 dark:bg-gray-900'
                                                                                    }`}>
                                                                                        <Icon className={`h-5 w-5 ${
                                                                                            isSelected 
                                                                                                ? 'text-amber-600 dark:text-amber-400'
                                                                                                : 'text-gray-600 dark:text-gray-400'
                                                                                        }`} />
                                                                                    </div>
                                                                                    <div className="min-w-0 flex-1">
                                                                                        <div className="flex items-center gap-2 mb-2">
                                                                                            <h3 className="font-semibold text-sm truncate">
                                                                                                {type.name}
                                                                                            </h3>
                                                                                            <Badge 
                                                                                                variant="outline"
                                                                                                className="text-xs flex-shrink-0 h-5 px-1.5 border-amber-300 text-amber-700 dark:text-amber-400"
                                                                                            >
                                                                                                Other
                                                                                            </Badge>
                                                                                        </div>
                                                                                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
                                                                                            {type.description || "Report a different issue not listed above"}
                                                                                        </p>
                                                                                        {/* Compact metadata */}
                                                                                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                                                                            <div className="flex items-center gap-1">
                                                                                                <Clock className="h-3 w-3" />
                                                                                                <span>{type.resolution_days}d</span>
                                                                                            </div>
                                                                                            <div className="flex items-center gap-1">
                                                                                                {type.requires_evidence ? (
                                                                                                    <Camera className="h-3 w-3 text-amber-600" />
                                                                                                ) : (
                                                                                                    <FileText className="h-3 w-3 text-gray-400" />
                                                                                                )}
                                                                                                <span>{type.requires_evidence ? 'Evidence' : 'Optional'}</span>
                                                                                            </div>
                                                                                            <div className="flex items-center gap-1">
                                                                                                {type.allows_anonymous ? (
                                                                                                    <Shield className="h-3 w-3 text-green-600" />
                                                                                                ) : (
                                                                                                    <UserX className="h-3 w-3 text-gray-400" />
                                                                                                )}
                                                                                                <span>{type.allows_anonymous ? 'Anon' : 'ID'}</span>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="flex-shrink-0 ml-2">
                                                                                    {isSelected ? (
                                                                                        <div className="w-6 h-6 rounded-full flex items-center justify-center bg-amber-600">
                                                                                            <Check className="h-3.5 w-3.5 text-white" />
                                                                                        </div>
                                                                                    ) : (
                                                                                        <ArrowRight className="h-4 w-4 text-gray-400" />
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </button>
                                                                    );
                                                                })}
                                                                {/* Fill empty slots in pair */}
                                                                {pair.filter(type => type && isOtherType(type)).length < 2 && (
                                                                    <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 min-h-[120px] bg-gray-50/50 dark:bg-gray-900/30 flex items-center justify-center">
                                                                        <div className="text-center text-gray-400 dark:text-gray-500">
                                                                            <div className="text-sm">No other options</div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </>
                                            ) : (
                                                <div className="text-center py-8 px-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
                                                        activeTab === 'issues' 
                                                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-500' 
                                                            : 'bg-purple-100 dark:bg-purple-900/30 text-purple-500'
                                                    }`}>
                                                        {activeTab === 'issues' ? (
                                                            <AlertCircle className="h-6 w-6" />
                                                        ) : (
                                                            <Megaphone className="h-6 w-6" />
                                                        )}
                                                    </div>
                                                    <h4 className="font-medium mb-1">No {activeTab} found</h4>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {searchQuery 
                                                            ? `Try a different search term or clear the search`
                                                            : `No ${activeTab} are currently available`
                                                        }
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Selected Type Summary */}
                                    {selectedType && (
                                        <div className={`mt-4 p-4 rounded-lg border ${
                                            selectedType.category === 'issue' 
                                                ? isOtherType(selectedType)
                                                    ? 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20'
                                                    : 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'
                                                : isOtherType(selectedType)
                                                ? 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20'
                                                : 'border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-900/20'
                                        }`}>
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start gap-3">
                                                    <div className={`p-2 rounded-lg ${
                                                        isOtherType(selectedType)
                                                            ? 'bg-amber-100 dark:bg-amber-900/30'
                                                            : selectedType.category === 'issue'
                                                            ? 'bg-blue-100 dark:bg-blue-900/30'
                                                            : 'bg-purple-100 dark:bg-purple-900/30'
                                                    }`}>
                                                        {(() => {
                                                            const Icon = isOtherType(selectedType) ? HelpCircle : (iconMap[selectedType.icon] || iconMap.default);
                                                            return <Icon className="h-5 w-5" style={{ color: isOtherType(selectedType) ? '#d97706' : selectedType.color }} />;
                                                        })()}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold flex items-center gap-2">
                                                            {selectedType.name}
                                                            {isOtherType(selectedType) ? (
                                                                <Badge 
                                                                    variant="outline"
                                                                    className="text-xs border-amber-300 text-amber-700 dark:text-amber-400"
                                                                >
                                                                    Other
                                                                </Badge>
                                                            ) : (
                                                                <Badge 
                                                                    style={{ backgroundColor: selectedType.priority_color }}
                                                                    className="text-xs"
                                                                >
                                                                    {selectedType.priority_label}
                                                                </Badge>
                                                            )}
                                                        </h4>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                            {selectedType.description}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedTypeId(null);
                                                        setData('report_type_id', null);
                                                    }}
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                                                <div className="text-center p-2 bg-white dark:bg-gray-900 rounded">
                                                    <div className="font-medium">Resolution Time</div>
                                                    <div className="text-gray-600 dark:text-gray-400">{selectedType.resolution_days} days</div>
                                                </div>
                                                <div className="text-center p-2 bg-white dark:bg-gray-900 rounded">
                                                    <div className="font-medium">Evidence</div>
                                                    <div className={selectedType.requires_evidence ? 'text-red-600' : 'text-green-600'}>
                                                        {selectedType.requires_evidence ? 'Required' : 'Optional'}
                                                    </div>
                                                </div>
                                                <div className="text-center p-2 bg-white dark:bg-gray-900 rounded">
                                                    <div className="font-medium">Anonymous</div>
                                                    <div className={selectedType.allows_anonymous ? 'text-green-600' : 'text-gray-600'}>
                                                        {selectedType.allows_anonymous ? 'Allowed' : 'Not allowed'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Right Column - Summary & Actions (Desktop only) */}
                                {!isMobile && (
                                    <div className="space-y-6">
                                        {/* Status Card */}
                                        <Card>
                                            <CardHeader className="pb-3">
                                                <CardTitle className="text-sm font-semibold">Report Status</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                {selectedType ? (
                                                    <div className="space-y-3">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm text-gray-600">Type</span>
                                                            <div className="flex items-center gap-1">
                                                                <span className={`text-sm font-medium ${
                                                                    isOtherType(selectedType) 
                                                                        ? 'text-amber-600' 
                                                                        : selectedType.category === 'issue'
                                                                        ? 'text-blue-600'
                                                                        : 'text-purple-600'
                                                                }`}>
                                                                    {isOtherType(selectedType) ? 'Other' : selectedType.category === 'issue' ? 'Issue' : 'Complaint'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm text-gray-600">Priority</span>
                                                            <Badge style={{ backgroundColor: selectedType.priority_color }}>
                                                                {selectedType.priority_label}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm text-gray-600">Evidence Required</span>
                                                            <span className={`text-sm font-medium ${selectedType.requires_evidence ? 'text-red-600' : 'text-green-600'}`}>
                                                                {selectedType.requires_evidence ? 'Yes' : 'No'}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm text-gray-600">Anonymous Allowed</span>
                                                            <span className={`text-sm font-medium ${selectedType.allows_anonymous ? 'text-green-600' : 'text-red-600'}`}>
                                                                {selectedType.allows_anonymous ? 'Yes' : 'No'}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm text-gray-600">Resolution Time</span>
                                                            <span className="text-sm font-medium">{selectedType.resolution_days} days</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-gray-500">Select a report type to see details</p>
                                                )}
                                                
                                                <Separator />
                                                
                                                <div className="text-sm">
                                                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                                                        <Clock className="h-4 w-4" />
                                                        <span>Current Step:</span>
                                                    </div>
                                                    <p className="font-medium">{steps[activeStep - 1].title}</p>
                                                    <p className="text-xs text-gray-500 mt-1">{steps[activeStep - 1].description}</p>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Requirements Status */}
                                        <Card>
                                            <CardHeader className="pb-3">
                                                <CardTitle className="text-sm font-semibold">Requirements</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                                <div className={`flex items-center justify-between ${data.report_type_id ? 'text-green-600' : 'text-gray-500'}`}>
                                                    <span className="text-sm">Report Type</span>
                                                    {data.report_type_id ? (
                                                        <Check className="h-4 w-4" />
                                                    ) : (
                                                        <span className="text-xs">Required</span>
                                                    )}
                                                </div>
                                                <div className={`flex items-center justify-between ${data.title.trim() ? 'text-green-600' : 'text-gray-500'}`}>
                                                    <span className="text-sm">Title</span>
                                                    {data.title.trim() ? (
                                                        <Check className="h-4 w-4" />
                                                    ) : (
                                                        <span className="text-xs">Required</span>
                                                    )}
                                                </div>
                                                <div className={`flex items-center justify-between ${data.description.trim() ? 'text-green-600' : 'text-gray-500'}`}>
                                                    <span className="text-sm">Description</span>
                                                    {data.description.trim() ? (
                                                        <Check className="h-4 w-4" />
                                                    ) : (
                                                        <span className="text-xs">Required</span>
                                                    )}
                                                </div>
                                                <div className={`flex items-center justify-between ${data.location.trim() ? 'text-green-600' : 'text-gray-500'}`}>
                                                    <span className="text-sm">Location</span>
                                                    {data.location.trim() ? (
                                                        <Check className="h-4 w-4" />
                                                    ) : (
                                                        <span className="text-xs">Required</span>
                                                    )}
                                                </div>
                                                {selectedType?.requires_evidence && (
                                                    <div className={`flex items-center justify-between ${(files.length > 0 || existingFiles.length > 0) ? 'text-green-600' : 'text-red-600'}`}>
                                                        <span className="text-sm">Evidence</span>
                                                        {(files.length > 0 || existingFiles.length > 0) ? (
                                                            <Check className="h-4 w-4" />
                                                        ) : (
                                                            <span className="text-xs">Required</span>
                                                        )}
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>

                                        {/* Draft Info */}
                                        {currentDraftId && (
                                            <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
                                                <CardHeader className="pb-3">
                                                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                                        <Save className="h-4 w-4 text-blue-600" />
                                                        Draft Saved Locally
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="text-sm space-y-2">
                                                        <p className="text-blue-700 dark:text-blue-300">
                                                            Your draft is saved in your browser's local storage.
                                                        </p>
                                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                                            Note: Drafts will be lost if you clear browser data.
                                                        </p>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={handleDeleteDraft}
                                                            className="w-full mt-2"
                                                        >
                                                            <Trash2 className="h-3 w-3 mr-2" />
                                                            Delete Draft
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )}

                                        {/* Tips */}
                                        <Card>
                                            <CardHeader className="pb-3">
                                                <CardTitle className="text-sm font-semibold">Helpful Tips</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <ul className="space-y-2 text-sm">
                                                    <li className="flex items-start gap-2">
                                                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                        <span>Be specific with dates and locations</span>
                                                    </li>
                                                    <li className="flex items-start gap-2">
                                                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                        <span>Provide clear photos as evidence</span>
                                                    </li>
                                                    <li className="flex items-start gap-2">
                                                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                        <span>Use "Other" option if your issue isn't listed</span>
                                                    </li>
                                                </ul>
                                            </CardContent>
                                        </Card>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* STEP 2: Details Form */}
                        {activeStep === 2 && (
                            <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
                                <div className="lg:col-span-2 space-y-6">
                                    <Card className="rounded-xl">
                                        <CardContent className="p-4 lg:p-6 pt-6 space-y-6">
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="title" className="text-sm font-medium flex items-center gap-2">
                                                        <FileText className="h-4 w-4" />
                                                        Report Title *
                                                    </Label>
                                                    <Input
                                                        id="title"
                                                        value={data.title}
                                                        onChange={e => setData('title', e.target.value)}
                                                        placeholder="Brief title for your report"
                                                        required
                                                        maxLength={255}
                                                        className="h-11 text-sm rounded-lg"
                                                    />
                                                    {errors.title && (
                                                        <p className="text-sm text-red-600">{errors.title}</p>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="location" className="text-sm font-medium flex items-center gap-2">
                                                        <MapPin className="h-4 w-4" />
                                                        Location *
                                                    </Label>
                                                    <Input
                                                        id="location"
                                                        value={data.location}
                                                        onChange={e => setData('location', e.target.value)}
                                                        placeholder="Where did this occur?"
                                                        required
                                                        maxLength={255}
                                                        className="h-11 text-sm rounded-lg"
                                                    />
                                                    {errors.location && (
                                                        <p className="text-sm text-red-600">{errors.location}</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="incident_date" className="text-sm font-medium flex items-center gap-2">
                                                        <Calendar className="h-4 w-4" />
                                                        Date *
                                                    </Label>
                                                    <Input
                                                        id="incident_date"
                                                        type="date"
                                                        value={data.incident_date}
                                                        onChange={e => setData('incident_date', e.target.value)}
                                                        max={today}
                                                        required
                                                        className="h-11 text-sm rounded-lg"
                                                    />
                                                    {errors.incident_date && (
                                                        <p className="text-sm text-red-600">{errors.incident_date}</p>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="incident_time" className="text-sm font-medium flex items-center gap-2">
                                                        <Clock className="h-4 w-4" />
                                                        Time (Optional)
                                                    </Label>
                                                    <Input
                                                        id="incident_time"
                                                        type="time"
                                                        value={data.incident_time}
                                                        onChange={e => setData('incident_time', e.target.value)}
                                                        className="h-11 text-sm rounded-lg"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="description" className="text-sm font-medium flex items-center gap-2">
                                                    <FileText className="h-4 w-4" />
                                                    Detailed Description *
                                                </Label>
                                                <Textarea
                                                    id="description"
                                                    value={data.description}
                                                    onChange={e => setData('description', e.target.value)}
                                                    placeholder="Describe what happened in detail..."
                                                    rows={4}
                                                    required
                                                    className="text-sm min-h-[100px] rounded-lg"
                                                />
                                                {errors.description && (
                                                    <p className="text-sm text-red-600">{errors.description}</p>
                                                )}
                                                <p className="text-xs text-gray-500">
                                                    Include specific details, impacts, and any safety concerns (minimum 15 characters)
                                                </p>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium">Urgency Level</Label>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {(['low', 'medium', 'high'] as const).map((level) => (
                                                        <div key={level}>
                                                            <input
                                                                type="radio"
                                                                id={`urgency-${level}`}
                                                                name="urgency"
                                                                value={level}
                                                                checked={data.urgency === level}
                                                                onChange={(e) => setData('urgency', e.target.value as 'low' | 'medium' | 'high')}
                                                                className="sr-only peer"
                                                            />
                                                            <Label 
                                                                htmlFor={`urgency-${level}`}
                                                                className={`
                                                                    flex flex-col items-center p-3 border rounded-lg cursor-pointer text-sm
                                                                    ${data.urgency === level ? 
                                                                        (level === 'low' ? 'border-green-500 bg-green-50 dark:bg-green-900/20' :
                                                                         level === 'medium' ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' :
                                                                         'border-red-500 bg-red-50 dark:bg-red-900/20') : 
                                                                        'border-gray-200 hover:border-gray-300'}
                                                                `}
                                                            >
                                                                <span className="font-medium">
                                                                    {level.charAt(0).toUpperCase() + level.slice(1)}
                                                                </span>
                                                                <span className="text-xs text-gray-500">
                                                                    {level === 'low' ? 'Can wait' : 
                                                                     level === 'medium' ? 'Normal' : 'Urgent'}
                                                                </span>
                                                            </Label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Right Column for Step 2 */}
                                {!isMobile && (
                                    <div className="space-y-6">
                                        <Card>
                                            <CardHeader className="pb-3">
                                                <CardTitle className="text-sm font-semibold">Step 2: Details</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="text-sm text-gray-600">
                                                    <p>Please provide clear and accurate information about your report:</p>
                                                    <ul className="mt-2 space-y-1 text-xs text-gray-500">
                                                        <li>• Title should be brief and descriptive</li>
                                                        <li>• Location should be specific (address, building, room)</li>
                                                        <li>• Include exact date and time if possible</li>
                                                        <li>• Detailed description helps officials understand the issue</li>
                                                    </ul>
                                                </div>
                                                
                                                <Separator />
                                                
                                                <div className="text-sm">
                                                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                                                        <Clock className="h-4 w-4" />
                                                        <span>Current Step:</span>
                                                    </div>
                                                    <p className="font-medium">{steps[activeStep - 1].title}</p>
                                                    <p className="text-xs text-gray-500 mt-1">{steps[activeStep - 1].description}</p>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Selected Type Preview */}
                                        {selectedType && (
                                            <Card>
                                                <CardHeader className="pb-3">
                                                    <CardTitle className="text-sm font-semibold">Selected Report Type</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-lg ${
                                                            isOtherType(selectedType)
                                                                ? 'bg-amber-100 dark:bg-amber-900/30'
                                                                : selectedType.category === 'issue'
                                                                ? 'bg-blue-100 dark:bg-blue-900/30'
                                                                : 'bg-purple-100 dark:bg-purple-900/30'
                                                        }`}>
                                                            {(() => {
                                                                const Icon = isOtherType(selectedType) ? HelpCircle : (iconMap[selectedType.icon] || iconMap.default);
                                                                return <Icon className="h-4 w-4" style={{ color: isOtherType(selectedType) ? '#d97706' : selectedType.color }} />;
                                                            })()}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-sm">{selectedType.name}</p>
                                                            <p className="text-xs text-gray-500">{selectedType.description}</p>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* STEP 3: Evidence Upload */}
                        {activeStep === 3 && (
                            <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
                                <div className="lg:col-span-2 space-y-6">
                                    <Card className="rounded-xl">
                                        <CardContent className="p-4 lg:p-6 pt-6 space-y-6">
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                multiple
                                                accept="image/*,.pdf,video/mp4,video/mov,video/avi"
                                                onChange={handleFileSelect}
                                                className="hidden"
                                            />
                                            
                                            <div 
                                                className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors bg-gray-50 dark:bg-gray-900"
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-4">
                                                    <Camera className="h-8 w-8 text-blue-500" />
                                                </div>
                                                <h4 className="font-semibold mb-2">Click to upload evidence</h4>
                                                <p className="text-sm text-gray-500 mb-4">
                                                    Drag and drop or click to browse files
                                                </p>
                                                <Button type="button" variant="outline">
                                                    <Upload className="h-4 w-4 mr-2" />
                                                    Select Files
                                                </Button>
                                                <p className="text-xs text-gray-400 mt-4">
                                                    JPG, PNG, GIF, WebP, PDF, MP4, MOV, AVI • Max 5MB per file • Up to 10 files
                                                </p>
                                            </div>

                                            {/* File Lists */}
                                            {(existingFiles.length > 0 || files.length > 0) && (
                                                <div className="space-y-4">
                                                    {/* Existing Files from Draft */}
                                                    {existingFiles.length > 0 && (
                                                        <div className="space-y-3">
                                                            <div className="flex items-center justify-between">
                                                                <h4 className="font-medium text-sm">Saved Files ({existingFiles.length})</h4>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        if (confirm('Remove all saved files?')) {
                                                                            setExistingFiles([]);
                                                                            toast.info('All files removed from draft');
                                                                        }
                                                                    }}
                                                                    className="text-xs h-7 px-3"
                                                                >
                                                                    Clear All
                                                                </Button>
                                                            </div>
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                                {existingFiles.map((file, index) => {
                                                                    const FileIcon = getFileIcon(file.type);
                                                                    const isImage = file.type.startsWith('image/');
                                                                    return (
                                                                        <div key={index} className="border rounded-lg overflow-hidden hover:border-blue-300 transition-colors bg-white dark:bg-gray-900">
                                                                            <div className="p-3">
                                                                                <div className="flex items-start justify-between">
                                                                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                                                                        <div className={`w-10 h-10 rounded flex items-center justify-center flex-shrink-0 ${
                                                                                            isImage ? 'bg-blue-50 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-900'
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
                                                                                    <Button
                                                                                        type="button"
                                                                                        variant="ghost"
                                                                                        size="icon"
                                                                                        onClick={() => removeExistingFile(index)}
                                                                                        className="flex-shrink-0 h-8 w-8"
                                                                                    >
                                                                                        <X className="h-4 w-4" />
                                                                                    </Button>
                                                                                </div>
                                                                                {isImage && file.preview && (
                                                                                    <div className="mt-3">
                                                                                        <div 
                                                                                            className="relative aspect-video rounded-md overflow-hidden bg-gray-100 dark:bg-gray-900 cursor-pointer"
                                                                                            onClick={() => openPreview(file.preview!, file.type, file.name)}
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

                                                    {/* New Files */}
                                                    {files.length > 0 && (
                                                        <div className="space-y-3">
                                                            <div className="flex items-center justify-between">
                                                                <h4 className="font-medium text-sm">New Files ({files.length})</h4>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        if (confirm('Remove all new files?')) {
                                                                            files.forEach(file => {
                                                                                if (file) {
                                                                                    removeFile(file.id);
                                                                                }
                                                                            });
                                                                        }
                                                                    }}
                                                                    className="text-xs h-7 px-3"
                                                                >
                                                                    Clear All
                                                                </Button>
                                                            </div>
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                                {files.map((file) => {
                                                                    if (!file) return null;
                                                                    const FileIcon = getFileIcon(file.type);
                                                                    const isImage = file.type.startsWith('image/');
                                                                    return (
                                                                        <div key={file.id} className="border rounded-lg overflow-hidden hover:border-blue-300 transition-colors bg-white dark:bg-gray-900">
                                                                            <div className="p-3">
                                                                                <div className="flex items-start justify-between">
                                                                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                                                                        <div className={`w-10 h-10 rounded flex items-center justify-center flex-shrink-0 ${
                                                                                            isImage ? 'bg-blue-50 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-900'
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
                                                                                    <Button
                                                                                        type="button"
                                                                                        variant="ghost"
                                                                                        size="icon"
                                                                                        onClick={() => removeFile(file.id)}
                                                                                        className="flex-shrink-0 h-8 w-8"
                                                                                    >
                                                                                        <X className="h-4 w-4" />
                                                                                    </Button>
                                                                                </div>
                                                                                {isImage && file.preview && (
                                                                                    <div className="mt-3">
                                                                                        <div 
                                                                                            className="relative aspect-video rounded-md overflow-hidden bg-gray-100 dark:bg-gray-900 cursor-pointer"
                                                                                            onClick={() => openPreview(file.preview, file.type, file.name)}
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
                                                </div>
                                            )}

                                            {/* Evidence Tips */}
                                            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                                                <div className="flex items-start gap-3">
                                                    <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                                    <div>
                                                        <h5 className="text-sm font-medium mb-1">What makes good evidence?</h5>
                                                        <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
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
                                </div>

                                {/* Right Column for Step 3 */}
                                {!isMobile && (
                                    <div className="space-y-6">
                                        <Card>
                                            <CardHeader className="pb-3">
                                                <CardTitle className="text-sm font-semibold">Step 3: Evidence</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="text-sm text-gray-600">
                                                    <p>Add photos or documents to support your report:</p>
                                                    <ul className="mt-2 space-y-1 text-xs text-gray-500">
                                                        <li>• Photos help officials understand the situation</li>
                                                        <li>• Documents can provide additional context</li>
                                                        <li>• Videos can show ongoing issues</li>
                                                        <li>• Multiple files can be uploaded</li>
                                                    </ul>
                                                </div>
                                                
                                                <Separator />
                                                
                                                <div className="text-sm">
                                                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                                                        <Clock className="h-4 w-4" />
                                                        <span>Current Step:</span>
                                                    </div>
                                                    <p className="font-medium">{steps[activeStep - 1].title}</p>
                                                    <p className="text-xs text-gray-500 mt-1">{steps[activeStep - 1].description}</p>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Evidence Requirement */}
                                        {selectedType && (
                                            <Card className={selectedType.requires_evidence ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20' : 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'}>
                                                <CardHeader className="pb-3">
                                                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                                        {selectedType.requires_evidence ? (
                                                            <>
                                                                <AlertTriangle className="h-4 w-4 text-red-600" />
                                                                <span>Evidence Required</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                                                <span>Evidence Optional</span>
                                                            </>
                                                        )}
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <p className="text-sm text-gray-600">
                                                        {selectedType.requires_evidence 
                                                            ? 'This report type requires evidence for proper investigation.'
                                                            : 'Evidence is optional but recommended for this report type.'
                                                        }
                                                    </p>
                                                </CardContent>
                                            </Card>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* STEP 4: Review & Submit */}
                        {activeStep === 4 && (
                            <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="space-y-6">
                                        {/* Report Summary */}
                                        <Card className="rounded-xl">
                                            <CardContent className="p-4 lg:p-6">
                                                <h3 className="font-medium mb-4 text-lg">Report Summary</h3>
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
                                                        <span className="text-gray-600 dark:text-gray-400">Type</span>
                                                        <div className="flex items-center gap-2">
                                                            {selectedType && (() => {
                                                                const Icon = isOtherType(selectedType) ? HelpCircle : (iconMap[selectedType.icon] || iconMap.default);
                                                                return <Icon className="h-4 w-4" style={{ color: isOtherType(selectedType) ? '#d97706' : selectedType.color }} />;
                                                            })()}
                                                            <span className="font-medium">{selectedType?.name}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
                                                        <span className="text-gray-600 dark:text-gray-400">Title</span>
                                                        <span className="font-medium">{data.title}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
                                                        <span className="text-gray-600 dark:text-gray-400">Location</span>
                                                        <span className="font-medium">{data.location}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
                                                        <span className="text-gray-600 dark:text-gray-400">Date & Time</span>
                                                        <span className="font-medium">
                                                            {data.incident_date} {data.incident_time && 'at'} {data.incident_time}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
                                                        <span className="text-gray-600 dark:text-gray-400">Urgency</span>
                                                        <Badge 
                                                            variant="outline"
                                                            className={`
                                                                ${data.urgency === 'high' ? 'border-red-200 text-red-700' :
                                                                data.urgency === 'medium' ? 'border-amber-200 text-amber-700' :
                                                                'border-green-200 text-green-700'}
                                                            `}
                                                        >
                                                            {data.urgency.charAt(0).toUpperCase() + data.urgency.slice(1)}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
                                                        <span className="text-gray-600 dark:text-gray-400">Attachments</span>
                                                        <span className="font-medium">
                                                            {files.length + existingFiles.length} files
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
                                                        <span className="text-gray-600 dark:text-gray-400">Reported By</span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium">
                                                                {anonymous ? 'Anonymous' : data.reporter_name}
                                                            </span>
                                                            {anonymous && (
                                                                <Badge variant="outline" className="text-xs">
                                                                    <Shield className="h-3 w-3 mr-1" />
                                                                    Protected
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {!anonymous && data.reporter_contact && (
                                                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
                                                            <span className="text-gray-600 dark:text-gray-400">Contact</span>
                                                            <span className="font-medium">{data.reporter_contact}</span>
                                                        </div>
                                                    )}
                                                    {currentDraftId && (
                                                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
                                                            <span className="text-gray-600 dark:text-gray-400">Draft Status</span>
                                                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                                <Save className="h-3 w-3 mr-1" />
                                                                Saved in Browser
                                                            </Badge>
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Anonymous Reporting */}
                                        <Card className="rounded-xl">
                                            <CardContent className="p-4 lg:p-6">
                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-1">
                                                        <div className="font-medium flex items-center gap-2">
                                                            <Shield className="h-4 w-4" />
                                                            Submit Anonymously
                                                        </div>
                                                        <p className="text-sm text-gray-500">
                                                            {selectedType?.allows_anonymous 
                                                                ? 'Your identity will be hidden from officials'
                                                                : 'Not available for this report type'
                                                            }
                                                        </p>
                                                    </div>
                                                    {selectedType?.allows_anonymous ? (
                                                        <button
                                                            type="button"
                                                            className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700 data-[state=checked]:bg-blue-600 transition-colors"
                                                            onClick={() => handleAnonymousToggle(!anonymous)}
                                                            style={{ backgroundColor: anonymous ? '#2563eb' : undefined }}
                                                        >
                                                            <span className="sr-only">Toggle anonymous</span>
                                                            <span 
                                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                                    anonymous ? 'translate-x-6' : 'translate-x-1'
                                                                }`}
                                                            />
                                                        </button>
                                                    ) : (
                                                        <div className="opacity-50 cursor-not-allowed">
                                                            <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700">
                                                                <span className="sr-only">Toggle anonymous</span>
                                                                <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Contact Information (if not anonymous) */}
                                        {!anonymous && (
                                            <Card className="rounded-xl">
                                                <CardContent className="p-4 lg:p-6 space-y-4">
                                                    <h4 className="font-medium">Contact Information</h4>
                                                    <div className="space-y-3">
                                                        <div className="space-y-2">
                                                            <Label htmlFor="reporter_name" className="text-sm font-medium">Name *</Label>
                                                            <Input
                                                                id="reporter_name"
                                                                value={data.reporter_name}
                                                                onChange={e => setData('reporter_name', e.target.value)}
                                                                placeholder="Your full name"
                                                                required={!anonymous}
                                                                maxLength={255}
                                                                className="h-11 text-sm rounded-lg"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor="reporter_contact" className="text-sm font-medium">Contact *</Label>
                                                            <Input
                                                                id="reporter_contact"
                                                                type="text"
                                                                value={data.reporter_contact}
                                                                onChange={e => setData('reporter_contact', e.target.value)}
                                                                placeholder="Email address or phone number"
                                                                required={!anonymous}
                                                                maxLength={255}
                                                                className="h-11 text-sm rounded-lg"
                                                            />
                                                            <p className="text-xs text-gray-500">
                                                                We'll use this to contact you about your report
                                                            </p>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )}

                                        {/* Terms Agreement */}
                                        <div className="p-4 border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                            <div className="flex items-start gap-3">
                                                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                                                        By submitting, you confirm:
                                                    </p>
                                                    <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
                                                        <li>• All information provided is accurate and truthful</li>
                                                        <li>• You have provided all required evidence</li>
                                                        <li>• You'll receive updates on your report status</li>
                                                        <li>• False reports may result in penalties</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column for Step 4 */}
                                {!isMobile && (
                                    <div className="space-y-6">
                                        <Card>
                                            <CardHeader className="pb-3">
                                                <CardTitle className="text-sm font-semibold">Step 4: Review & Submit</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="text-sm text-gray-600">
                                                    <p>Review all information before submitting your report:</p>
                                                    <ul className="mt-2 space-y-1 text-xs text-gray-500">
                                                        <li>• Verify all details are correct</li>
                                                        <li>• Check evidence is attached if required</li>
                                                        <li>• Confirm contact information</li>
                                                        <li>• Read terms and conditions</li>
                                                    </ul>
                                                </div>
                                                
                                                <Separator />
                                                
                                                <div className="text-sm">
                                                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                                                        <Clock className="h-4 w-4" />
                                                        <span>Current Step:</span>
                                                    </div>
                                                    <p className="font-medium">{steps[activeStep - 1].title}</p>
                                                    <p className="text-xs text-gray-500 mt-1">{steps[activeStep - 1].description}</p>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Submission Status */}
                                        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                                            <CardHeader className="pb-3">
                                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                    Ready to Submit
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-sm text-gray-600">
                                                    Your report is complete and ready for submission.
                                                </p>
                                                <div className="mt-3 space-y-2">
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="text-gray-500">Report Type:</span>
                                                        <span className="font-medium">{selectedType?.name}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="text-gray-500">Files Attached:</span>
                                                        <span className="font-medium">{files.length + existingFiles.length}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="text-gray-500">Report Status:</span>
                                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                            Ready
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                )}
                            </div>
                        )}
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
                                        disabled={
                                            (activeStep === 1 && !data.report_type_id) ||
                                            (activeStep === 2 && (!data.title.trim() || !data.description.trim() || !data.location.trim() || !data.incident_date)) ||
                                            (activeStep === 3 && selectedType?.requires_evidence && (!Array.isArray(data.evidence) || data.evidence.length === 0) && existingFiles.length === 0)
                                        }
                                    >
                                        Continue
                                    </Button>
                                ) : (
                                    <Button 
                                        type="button"
                                        className="flex-1" 
                                        onClick={handleSubmit}
                                        disabled={processing || isSubmitting}
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
                            {activeStep === 4 && (
                                <div className="text-center mt-2">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {!anonymous && data.reporter_name && data.reporter_contact 
                                            ? 'Ready to submit your report'
                                            : anonymous
                                            ? 'Ready to submit anonymously'
                                            : 'Please complete all required fields'
                                        }
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Desktop Navigation */}
                    {!isMobile && (
                        <div className="sticky bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent dark:from-gray-900 dark:via-gray-900 pt-6 border-t dark:border-gray-800 z-30">
                            <div className="px-6 pb-6">
                                <div className="flex items-center justify-between max-w-4xl mx-auto">
                                    <div className="flex items-center gap-4">
                                        {activeStep > 1 ? (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={prevStep}
                                                className="gap-2 px-6"
                                            >
                                                <ArrowLeft className="h-4 w-4" />
                                                Previous
                                            </Button>
                                        ) : (
                                            <Link href="/resident/community-reports">
                                                <Button type="button" variant="outline" className="px-6">
                                                    Cancel
                                                </Button>
                                            </Link>
                                        )}
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={handleSaveDraft}
                                            disabled={isSavingDraft}
                                            className="gap-2"
                                        >
                                            <Save className="h-4 w-4" />
                                            {isSavingDraft ? 'Saving...' : 'Save Draft'}
                                        </Button>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {activeStep < 4 ? (
                                            <Button
                                                type="button"
                                                onClick={nextStep}
                                                className="gap-2 px-6"
                                                disabled={
                                                    (activeStep === 1 && !data.report_type_id) ||
                                                    (activeStep === 2 && (!data.title.trim() || !data.description.trim() || !data.location.trim() || !data.incident_date)) ||
                                                    (activeStep === 3 && selectedType?.requires_evidence && (!Array.isArray(data.evidence) || data.evidence.length === 0) && existingFiles.length === 0)
                                                }
                                            >
                                                Next Step
                                                <ArrowRight className="h-4 w-4" />
                                            </Button>
                                        ) : (
                                            <Button 
                                                type="button"
                                                size="lg" 
                                                className="px-8 gap-2"
                                                onClick={handleSubmit}
                                                disabled={isSubmitting || processing}
                                            >
                                                <Send className="h-4 w-4" />
                                                {isSubmitting ? 'Submitting...' : 'Submit Report'}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </form>
            </div>

            {/* Image/File Preview Modal */}
            {previewModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b">
                            <div className="flex items-center gap-3">
                                {previewModal.type.startsWith('image/') ? (
                                    <ImageIcon className="h-5 w-5 text-blue-500" />
                                ) : previewModal.type.startsWith('video/') ? (
                                    <Video className="h-5 w-5 text-purple-500" />
                                ) : (
                                    <FileText className="h-5 w-5 text-gray-500" />
                                )}
                                <h3 className="font-semibold truncate">{previewModal.name}</h3>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={closePreview}
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                        <div className="p-6 overflow-auto max-h-[calc(90vh-80px)]">
                            {previewModal.type.startsWith('image/') ? (
                                <div className="flex items-center justify-center">
                                    <img 
                                        src={previewModal.url} 
                                        alt={previewModal.name}
                                        className="max-w-full max-h-[70vh] object-contain rounded-lg"
                                    />
                                </div>
                            ) : previewModal.type.startsWith('video/') ? (
                                <div className="aspect-video max-w-3xl mx-auto">
                                    <video 
                                        src={previewModal.url} 
                                        controls
                                        className="w-full h-full rounded-lg bg-black"
                                    >
                                        Your browser does not support the video tag.
                                    </video>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center p-12">
                                    <FileText className="h-24 w-24 text-gray-400 mb-4" />
                                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                                        Preview not available for this file type
                                    </p>
                                    <a 
                                        href={previewModal.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline"
                                    >
                                        Open file in new tab
                                    </a>
                                </div>
                            )}
                        </div>
                        <div className="p-4 border-t flex items-center justify-between">
                            <span className="text-sm text-gray-500">{previewModal.type}</span>
                            <Button
                                type="button"
                                onClick={closePreview}
                            >
                                Close Preview
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Emergency Modal */}
            {showEmergencyModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-sm w-full">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-red-600">Emergency Contact</h3>
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
                                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
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
                                </div>
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Phone className="h-5 w-5 text-blue-600" />
                                        <span className="font-bold">Local Authorities</span>
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
        </ResidentLayout>
    );
}