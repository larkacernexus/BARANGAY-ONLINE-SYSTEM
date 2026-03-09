import AppLayout from '@/layouts/admin-app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { format } from 'date-fns';
import { route } from 'ziggy-js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    Eye,
    Edit,
    Trash2,
    ArrowLeft,
    Calendar,
    Clock,
    MapPin,
    User,
    Phone,
    Mail,
    Home,
    FileText,
    MessageSquare,
    AlertTriangle,
    CheckCircle,
    Archive,
    Send,
    Printer,
    Copy,
    Download,
    EyeOff,
    Shield,
    Building,
    ExternalLink,
    MoreVertical,
    AlertCircle,
    FileImage,
    Paperclip,
    Camera,
    History,
    BarChart3,
    Settings,
    UserCheck,
    MessageCircle,
    PhoneCall,
    Mail as MailIcon,
    Map,
    Globe,
    Hash,
    Tag,
    Layers,
    Filter,
    RefreshCw,
    Link as LinkIcon,
    Check,
    X,
    ShieldAlert,
    Bell,
    Star,
    Flag,
    Award,
    Trophy,
    Medal,
    Target,
    Zap,
    Lock,
    Unlock,
    Key,
    QrCode,
    Scan,
    Maximize2,
    Minimize2,
    ChevronRight,
    ChevronDown,
    ChevronUp,
    Plus,
    Minus,
    Search,
    Filter as FilterIcon,
    SortAsc,
    SortDesc,
    Grid,
    List,
    Settings as SettingsIcon,
    HelpCircle,
    Info,
    AlertOctagon,
    AlertTriangle as AlertTriangleIcon,
    CheckSquare,
    Square,
    Circle,
    Radio,
    ToggleLeft,
    ToggleRight,
    Sun,
    Moon,
    Cloud,
    CloudRain,
    CloudSnow,
    CloudLightning,
    CloudDrizzle,
    Wind,
    Thermometer,
    Droplets,
    Umbrella,
    CloudSun,
    CloudMoon,
    CloudFog,
    CloudHail,
    Tornado,
    Snowflake,
    Haze,
    Sunrise,
    Sunset,
    Moon as MoonIcon,
    Sun as SunIcon,
    ThermometerSun,
    ThermometerSnowflake,
    Droplet,
    Wind as WindIcon,
    Cloud as CloudIcon,
    CloudOff,
    CloudUpload,
    CloudDownload,
    CloudCheck,
    CloudLightning as CloudLightningIcon,
    CloudRain as CloudRainIcon,
    CloudSnow as CloudSnowIcon,
    CloudDrizzle as CloudDrizzleIcon,
    CloudHail as CloudHailIcon,
    Tornado as TornadoIcon,
    Snowflake as SnowflakeIcon,
    Haze as HazeIcon,
    Sunrise as SunriseIcon,
    Sunset as SunsetIcon,
    Users,
    Repeat,
    TreePine,
    VolumeX,
    Volume,
    Volume2,
    Mic,
    Timer,
    AlertOctagon as AlertOctagonIcon
} from 'lucide-react';

type CommunityReport = {
    id: number;
    report_number: string;
    user_id: number;
    user?: {
        id: number;
        first_name: string;
        last_name: string;
        email?: string;
        contact_number?: string;
        address?: string;
        purok?: string;
    };
    report_type?: {
        id: number;
        name: string;
        category: string;
        description?: string;
    };
    title: string;
    description: string;
    detailed_description?: string;
    location: string | null;
    incident_date: string | null;
    incident_time?: string | null;
    urgency_level: 'low' | 'medium' | 'high';
    recurring_issue: boolean;
    affected_people: 'individual' | 'family' | 'community';
    estimated_affected_count?: number | null;
    is_anonymous: boolean;
    reporter_name?: string | null;
    reporter_contact?: string | null;
    reporter_address?: string | null;
    perpetrator_details?: string | null;
    preferred_resolution?: string | null;
    has_previous_report: boolean;
    previous_report_id?: number | null;
    previous_report?: {
        id: number;
        report_number: string;
        title: string;
        status: string;
    } | null;
    impact_level: 'low' | 'moderate' | 'high' | 'severe';
    safety_concern: boolean;
    environmental_impact: boolean;
    noise_level?: 'low' | 'moderate' | 'high' | 'severe' | null;
    duration_hours?: number | null;
    status: 'pending' | 'under_review' | 'assigned' | 'in_progress' | 'resolved' | 'rejected';
    priority: 'low' | 'medium' | 'high' | 'critical';
    assigned_to?: number | null;
    assignedTo?: {
        id: number;
        first_name: string;
        last_name: string;
        name?: string;
        email?: string;
        contact_number?: string;
        position?: string;
        role?: string;
    } | null;
    resolution_notes?: string | null;
    resolved_at?: string | null;
    acknowledged_at?: string | null;
    created_at: string | null;
    updated_at: string | null;
    evidences?: Array<{
        id: number;
        file_path: string;
        file_name: string;
        file_type: string;
        file_size: number;
        url?: string;
    }>;
    status_color?: string | null;
    priority_color?: string | null;
    urgency_color?: string | null;
    canEdit?: boolean;
};

interface ActivityLog {
    id: number;
    user_id: number;
    user_name: string;
    action: string;
    details: string;
    created_at: string;
    ip_address?: string;
    user_agent?: string;
    changes?: any;
}

interface StaffMember {
    id: number;
    name: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    position?: string;
    role?: string;
    role_id?: number;
    avatar?: string;
    initials?: string;
}

declare module '@inertiajs/react' {
    interface PageProps {
        report: CommunityReport;
        similar_reports?: CommunityReport[];
        activity_logs?: ActivityLog[];
        owner_notifications?: any[];
        flash?: {
            success?: string;
            error?: string;
        };
        staff?: StaffMember[];
        statuses?: string[];
        priorities?: string[];
        urgencies?: string[];
        impact_levels?: string[];
        affected_people_options?: string[];
        report_types?: Array<{
            id: number;
            name: string;
            category: string;
        }>;
    }
}

// Helper functions
const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A';
    try {
        return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
        return 'Invalid Date';
    }
};

const formatDateTime = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A';
    try {
        return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch (error) {
        return 'Invalid Date';
    }
};

const formatTime = (timeString: string | null | undefined): string => {
    if (!timeString) return 'Not specified';
    try {
        return format(new Date(`2000-01-01T${timeString}`), 'hh:mm a');
    } catch {
        return 'Invalid time';
    }
};

const getTimeAgo = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
        return formatDate(dateString);
    } catch (error) {
        return 'Invalid Date';
    }
};

const getStatusIcon = (status: string | null | undefined) => {
    switch (status) {
        case 'resolved':
            return <CheckCircle className="h-5 w-5 text-green-500" />;
        case 'in_progress':
            return <Clock className="h-5 w-5 text-blue-500" />;
        case 'under_review':
            return <Eye className="h-5 w-5 text-amber-500" />;
        case 'assigned':
            return <UserCheck className="h-5 w-5 text-purple-500" />;
        case 'pending':
            return <AlertCircle className="h-5 w-5 text-amber-500" />;
        case 'rejected':
            return <X className="h-5 w-5 text-red-500" />;
        default:
            return <AlertCircle className="h-5 w-5" />;
    }
};

const getPriorityIcon = (priority: string | null | undefined) => {
    switch (priority) {
        case 'critical':
            return <AlertTriangle className="h-5 w-5 text-red-500" />;
        case 'high':
            return <AlertTriangle className="h-5 w-5 text-orange-500" />;
        case 'medium':
            return <AlertCircle className="h-5 w-5 text-yellow-500" />;
        case 'low':
            return <Info className="h-5 w-5 text-blue-500" />;
        default:
            return <Clock className="h-5 w-5" />;
    }
};

const getUrgencyIcon = (urgency: string | null | undefined) => {
    switch (urgency) {
        case 'high':
            return <Zap className="h-4 w-4 text-red-500" />;
        case 'medium':
            return <Zap className="h-4 w-4 text-yellow-500" />;
        case 'low':
            return <Zap className="h-4 w-4 text-green-500" />;
        default:
            return <Zap className="h-4 w-4" />;
    }
};

const getImpactIcon = (impact: string | null | undefined) => {
    switch (impact) {
        case 'severe':
            return <AlertOctagonIcon className="h-4 w-4 text-red-500" />;
        case 'high':
            return <AlertTriangle className="h-4 w-4 text-orange-500" />;
        case 'moderate':
            return <AlertCircle className="h-4 w-4 text-yellow-500" />;
        case 'low':
            return <Info className="h-4 w-4 text-blue-500" />;
        default:
            return <AlertCircle className="h-4 w-4" />;
    }
};

const getNoiseLevelIcon = (noise: string | null | undefined) => {
    switch (noise) {
        case 'severe':
            return <Mic className="h-4 w-4 text-red-500" />;
        case 'high':
            return <Volume2 className="h-4 w-4 text-orange-500" />;
        case 'moderate':
            return <Volume className="h-4 w-4 text-yellow-500" />;
        case 'low':
            return <VolumeX className="h-4 w-4 text-green-500" />;
        default:
            return <Volume className="h-4 w-4" />;
    }
};

const getStatusColor = (status: string | null | undefined): string => {
    switch (status) {
        case 'resolved': return 'bg-green-100 text-green-800';
        case 'in_progress': return 'bg-blue-100 text-blue-800';
        case 'under_review': return 'bg-amber-100 text-amber-800';
        case 'assigned': return 'bg-purple-100 text-purple-800';
        case 'pending': return 'bg-yellow-100 text-yellow-800';
        case 'rejected': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const getPriorityColor = (priority: string | null | undefined): string => {
    switch (priority) {
        case 'critical': return 'bg-red-100 text-red-800';
        case 'high': return 'bg-orange-100 text-orange-800';
        case 'medium': return 'bg-yellow-100 text-yellow-800';
        case 'low': return 'bg-blue-100 text-blue-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const getUrgencyColor = (urgency: string | null | undefined): string => {
    switch (urgency) {
        case 'high': return 'bg-red-100 text-red-800';
        case 'medium': return 'bg-yellow-100 text-yellow-800';
        case 'low': return 'bg-green-100 text-green-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const getImpactColor = (impact: string | null | undefined): string => {
    switch (impact) {
        case 'severe': return 'bg-red-100 text-red-800';
        case 'high': return 'bg-orange-100 text-orange-800';
        case 'moderate': return 'bg-yellow-100 text-yellow-800';
        case 'low': return 'bg-green-100 text-green-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const getNoiseLevelColor = (noise: string | null | undefined): string => {
    switch (noise) {
        case 'severe': return 'bg-red-100 text-red-800';
        case 'high': return 'bg-orange-100 text-orange-800';
        case 'moderate': return 'bg-yellow-100 text-yellow-800';
        case 'low': return 'bg-green-100 text-green-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

// Format status text safely
const formatStatusText = (status: string | null | undefined): string => {
    if (!status) return 'Unknown';
    return status.replace('_', ' ');
};

// Safe string includes helper
const safeIncludes = (str: string | null | undefined, searchString: string): boolean => {
    if (!str) return false;
    return str.toLowerCase().includes(searchString.toLowerCase());
};

// Get affected people icon
const getAffectedPeopleIcon = (type: string | null | undefined) => {
    switch (type) {
        case 'individual': return <User className="h-4 w-4" />;
        case 'family': return <Home className="h-4 w-4" />;
        case 'community': return <Building className="h-4 w-4" />;
        default: return <User className="h-4 w-4" />;
    }
};

// Get full name - handles both user and staff member objects
const getFullName = (person: { first_name?: string; last_name?: string; name?: string }) => {
    if (person.first_name && person.last_name) {
        return `${person.first_name} ${person.last_name}`.trim();
    }
    return person.name || 'Unknown User';
};

export default function CommunityReportShow({
    report,
    similar_reports = [],
    activity_logs = [],
    owner_notifications = [],
    flash,
    staff = [],
    statuses = ['pending', 'under_review', 'assigned', 'in_progress', 'resolved', 'rejected'],
    priorities = ['low', 'medium', 'high', 'critical'],
    urgencies = ['low', 'medium', 'high'],
    impact_levels = ['low', 'moderate', 'high', 'severe'],
    affected_people_options = ['individual', 'family', 'community'],
    report_types = []
}: {
    report: CommunityReport | null;
    similar_reports?: CommunityReport[];
    activity_logs?: ActivityLog[];
    owner_notifications?: any[];
    flash?: {
        success?: string;
        error?: string;
    };
    staff?: StaffMember[];
    statuses?: string[];
    priorities?: string[];
    urgencies?: string[];
    impact_levels?: string[];
    affected_people_options?: string[];
    report_types?: Array<{ id: number; name: string; category: string }>;
}) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [adminNotes, setAdminNotes] = useState(report?.resolution_notes || '');
    const [isSavingNotes, setIsSavingNotes] = useState(false);
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState('details');
    const [showAssignDialog, setShowAssignDialog] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<number | null>(report?.assigned_to || null);
    const [isAssigning, setIsAssigning] = useState(false);
    const [assignNotes, setAssignNotes] = useState('');
    const [staffSearch, setStaffSearch] = useState('');

    // Handle null report
    if (!report) {
        return (
            <AppLayout
                title="Community Report Not Found"
                breadcrumbs={[
                    { title: 'Dashboard', href: '/admin/dashboard' },
                    { title: 'Community Reports', href: '/admin/community-reports' },
                    { title: 'Not Found', href: '#' }
                ]}
            >
                <div className="text-center py-12">
                    <AlertCircle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Community Report Not Found</h1>
                    <p className="text-gray-600 mb-6">The community report you are looking for does not exist or has been removed.</p>
                    <Link href={route('admin.community-reports.index')}>
                        <Button>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Community Reports
                        </Button>
                    </Link>
                </div>
            </AppLayout>
        );
    }

    // Handle delete
    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(route('admin.community-reports.destroy', report.id), {
            preserveScroll: true,
            onFinish: () => setIsDeleting(false),
        });
    };

    // Handle save resolution notes
    const handleSaveNotes = () => {
        setIsSavingNotes(true);
        router.put(route('admin.community-reports.update', report.id), {
            resolution_notes: adminNotes,
        }, {
            preserveScroll: true,
            onFinish: () => setIsSavingNotes(false),
        });
    };

    // Handle copy report number
    const handleCopyReportNumber = () => {
        if (report.report_number) {
            navigator.clipboard.writeText(report.report_number).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            });
        }
    };

    // Handle print
    const handlePrint = () => {
        window.open(`/admin/community-reports/${report.id}/print`, '_blank');
    };

    // Handle status change
    const handleStatusChange = (newStatus: string) => {
        if (confirm(`Change community report status to ${newStatus.replace('_', ' ')}?`)) {
            router.put(route('admin.community-reports.update', report.id), {
                status: newStatus,
            }, {
                preserveScroll: true,
            });
        }
    };

    // Handle priority change
    const handlePriorityChange = (newPriority: string) => {
        router.put(route('admin.community-reports.update', report.id), {
            priority: newPriority,
        }, {
            preserveScroll: true,
        });
    };

    // Handle urgency change
    const handleUrgencyChange = (newUrgency: string) => {
        router.put(route('admin.community-reports.update', report.id), {
            urgency_level: newUrgency,
        }, {
            preserveScroll: true,
        });
    };

    // Handle impact level change
    const handleImpactChange = (newImpact: string) => {
        router.put(route('admin.community-reports.update', report.id), {
            impact_level: newImpact,
        }, {
            preserveScroll: true,
        });
    };

    // Handle assign to staff
    const handleAssignToStaff = () => {
        setShowAssignDialog(true);
    };

    // Handle staff assignment submission
    const handleAssignSubmit = () => {
        if (!selectedStaff) {
            alert('Please select a staff member');
            return;
        }

        setIsAssigning(true);
        const selectedStaffMember = staff.find(s => s.id === selectedStaff);
        const notesPrefix = `[Assigned to ${selectedStaffMember?.name || getFullName(selectedStaffMember as any)} on ${new Date().toLocaleDateString()}]`;
        
        router.put(route('admin.community-reports.update', report.id), {
            assigned_to: selectedStaff,
            status: 'assigned',
            resolution_notes: `${adminNotes}\n\n${notesPrefix}: ${assignNotes}`.trim()
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsAssigning(false);
                setShowAssignDialog(false);
                setAssignNotes('');
            },
            onError: () => {
                setIsAssigning(false);
            },
        });
    };

    // Handle unassign staff
    const handleUnassignStaff = () => {
        if (confirm('Unassign this report from current staff?')) {
            router.put(route('admin.community-reports.update', report.id), {
                assigned_to: null,
                status: 'pending'
            }, {
                preserveScroll: true,
            });
        }
    };

    // Handle send response
    const handleSendResponse = () => {
        window.open(`/admin/community-reports/${report.id}/response`, '_blank');
    };

    // Calculate response time
    const calculateResponseTime = () => {
        if (!report.created_at) return 'N/A';
        const created = new Date(report.created_at);
        const now = new Date();
        const diffMs = now.getTime() - created.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffHours < 24) {
            return `${diffHours} hours`;
        } else {
            return `${diffDays} days`;
        }
    };

    // Filter staff based on search
    const filteredStaff = staff.filter(staffMember => 
        staffMember.name.toLowerCase().includes(staffSearch.toLowerCase()) ||
        (staffMember.first_name && staffMember.first_name.toLowerCase().includes(staffSearch.toLowerCase())) ||
        (staffMember.last_name && staffMember.last_name.toLowerCase().includes(staffSearch.toLowerCase())) ||
        staffMember.email?.toLowerCase().includes(staffSearch.toLowerCase()) ||
        staffMember.phone?.toLowerCase().includes(staffSearch.toLowerCase()) ||
        staffMember.position?.toLowerCase().includes(staffSearch.toLowerCase()) ||
        staffMember.role?.toLowerCase().includes(staffSearch.toLowerCase())
    );

    // Get selected staff member details
    const selectedStaffMember = selectedStaff ? staff.find(s => s.id === selectedStaff) : null;

    return (
        <AppLayout
            title={`Community Report #${report.report_number || 'N/A'}`}
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Community Reports', href: '/admin/community-reports' },
                { title: `#${report.report_number || 'N/A'}`, href: route('admin.community-reports.show', report.id) }
            ]}
        >
            <TooltipProvider>
                <div className="space-y-6">
                    {/* Flash Messages */}
                    {flash?.success && (
                        <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                            <div className="flex items-center">
                                <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                                <div>
                                    <p className="text-green-800 font-medium">Success</p>
                                    <p className="text-green-700 text-sm mt-1">{flash.success}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {flash?.error && (
                        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                            <div className="flex items-center">
                                <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
                                <div>
                                    <p className="text-red-800 font-medium">Error</p>
                                    <p className="text-red-700 text-sm mt-1">{flash.error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Header with Actions */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <Link href={route('admin.community-reports.index')}>
                                <Button variant="outline" size="sm" className="shrink-0">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    <span className="hidden sm:inline">Back to List</span>
                                    <span className="sm:hidden">Back</span>
                                </Button>
                            </Link>
                            <div className="min-w-0">
                                <h1 className="text-lg sm:text-2xl md:text-3xl font-bold tracking-tight text-gray-900 truncate">
                                    Report #{report.report_number || 'N/A'}
                                </h1>
                                <p className="text-sm sm:text-base text-gray-600 mt-1 truncate">
                                    {report.title || 'No title'}
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
                            <div className="flex gap-2">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handlePrint}
                                            className="shrink-0"
                                        >
                                            <Printer className="h-4 w-4 sm:mr-2" />
                                            <span className="hidden sm:inline">Print</span>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        Print report details
                                    </TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleCopyReportNumber}
                                            disabled={!report.report_number}
                                            className="shrink-0"
                                        >
                                            {copied ? (
                                                <Check className="h-4 w-4 sm:mr-2 text-green-600" />
                                            ) : (
                                                <Copy className="h-4 w-4 sm:mr-2" />
                                            )}
                                            <span className="hidden sm:inline">
                                                {copied ? 'Copied!' : 'Copy ID'}
                                            </span>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        Copy report number
                                    </TooltipContent>
                                </Tooltip>

                                <Link href={route('admin.community-reports.edit', report.id)}>
                                    <Button variant="outline" size="sm" className="shrink-0">
                                        <Edit className="h-4 w-4 sm:mr-2" />
                                        <span className="hidden sm:inline">Edit</span>
                                    </Button>
                                </Link>

                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => setShowDeleteDialog(true)}
                                    className="shrink-0"
                                >
                                    <Trash2 className="h-4 w-4 sm:mr-2" />
                                    <span className="hidden sm:inline">Delete</span>
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Report Details */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Status and Priority Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Status Card */}
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-medium text-gray-500">
                                            Current Status
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            {getStatusIcon(report.status)}
                                            <div className="min-w-0 flex-1">
                                                <p className="text-lg sm:text-xl font-semibold capitalize truncate">
                                                    {formatStatusText(report.status)}
                                                </p>
                                                {report.resolved_at && (
                                                    <p className="text-sm text-gray-500 truncate">
                                                        Resolved: {formatDate(report.resolved_at)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* Status Options */}
                                        <div className="pt-3 border-t">
                                            <p className="text-xs font-medium text-gray-500 mb-2">Change Status:</p>
                                            <div className="flex flex-wrap gap-1">
                                                {statuses.map((status) => (
                                                    <Button
                                                        key={status}
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleStatusChange(status)}
                                                        className={`h-7 text-xs px-2 ${
                                                            report.status === status 
                                                                ? 'bg-blue-50 text-blue-700 border-blue-200' 
                                                                : ''
                                                        }`}
                                                    >
                                                        {status === 'in_progress' ? 'In Progress' : status.replace('_', ' ')}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Priority Card */}
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-medium text-gray-500">
                                            Priority Level
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center gap-3">
                                            {getPriorityIcon(report.priority)}
                                            <div className="min-w-0 flex-1">
                                                <p className="text-lg sm:text-xl font-semibold capitalize truncate">
                                                    {report.priority || 'Not set'}
                                                </p>
                                                <p className="text-xs sm:text-sm text-gray-500 truncate">
                                                    {report.priority === 'critical' ? 'Immediate attention required' :
                                                     report.priority === 'high' ? 'Urgent attention needed' :
                                                     report.priority === 'medium' ? 'Moderate attention needed' :
                                                     report.priority === 'low' ? 'Standard attention' : 'Priority not set'}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        {/* Priority Information */}
                                        <div className="pt-3 border-t mt-3">
                                            <p className="text-xs font-medium text-gray-500 mb-2">Priority Information:</p>
                                            <div className="flex flex-wrap gap-1">
                                                {priorities.map((priority) => (
                                                    <Button
                                                        key={priority}
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handlePriorityChange(priority)}
                                                        className={`h-7 text-xs px-2 ${getPriorityColor(priority)} ${
                                                            report.priority === priority 
                                                                ? 'border-current font-semibold' 
                                                                : 'opacity-60'
                                                        }`}
                                                    >
                                                        {priority}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Urgency and Impact Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Urgency Card */}
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-medium text-gray-500">
                                            Urgency Level
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center gap-3">
                                            {getUrgencyIcon(report.urgency_level)}
                                            <div className="min-w-0 flex-1">
                                                <p className="text-lg sm:text-xl font-semibold capitalize truncate">
                                                    {report.urgency_level || 'Not set'}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="pt-3 border-t mt-3">
                                            <p className="text-xs font-medium text-gray-500 mb-2">Change Urgency:</p>
                                            <div className="flex flex-wrap gap-1">
                                                {urgencies.map((urgency) => (
                                                    <Button
                                                        key={urgency}
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleUrgencyChange(urgency)}
                                                        className={`h-7 text-xs px-2 ${getUrgencyColor(urgency)} ${
                                                            report.urgency_level === urgency 
                                                                ? 'border-current font-semibold' 
                                                                : 'opacity-60'
                                                        }`}
                                                    >
                                                        {urgency}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Impact Card */}
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-medium text-gray-500">
                                            Impact Level
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center gap-3">
                                            {getImpactIcon(report.impact_level)}
                                            <div className="min-w-0 flex-1">
                                                <p className="text-lg sm:text-xl font-semibold capitalize truncate">
                                                    {report.impact_level || 'Not set'}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="pt-3 border-t mt-3">
                                            <p className="text-xs font-medium text-gray-500 mb-2">Change Impact:</p>
                                            <div className="flex flex-wrap gap-1">
                                                {impact_levels.map((impact) => (
                                                    <Button
                                                        key={impact}
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleImpactChange(impact)}
                                                        className={`h-7 text-xs px-2 ${getImpactColor(impact)} ${
                                                            report.impact_level === impact 
                                                                ? 'border-current font-semibold' 
                                                                : 'opacity-60'
                                                        }`}
                                                    >
                                                        {impact}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Tabs for Details, Evidence, Activity */}
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                                <TabsList className="grid grid-cols-3 w-full">
                                    <TabsTrigger value="details" className="text-xs sm:text-sm">
                                        <FileText className="h-4 w-4 mr-1 sm:mr-2" />
                                        <span className="truncate">Details</span>
                                    </TabsTrigger>
                                    <TabsTrigger value="evidence" className="text-xs sm:text-sm">
                                        <Paperclip className="h-4 w-4 mr-1 sm:mr-2" />
                                        <span className="truncate">Evidence</span>
                                    </TabsTrigger>
                                    <TabsTrigger value="activity" className="text-xs sm:text-sm">
                                        <History className="h-4 w-4 mr-1 sm:mr-2" />
                                        <span className="truncate">Activity</span>
                                    </TabsTrigger>
                                </TabsList>

                                {/* Details Tab */}
                                <TabsContent value="details" className="space-y-6">
                                    {/* Report Information */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg sm:text-xl">Report Information</CardTitle>
                                            <CardDescription className="text-sm sm:text-base">
                                                Detailed information about the community report
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label className="text-xs sm:text-sm font-medium text-gray-500">Report Type</Label>
                                                    <p className="mt-1 text-sm sm:text-base font-medium truncate">
                                                        {report.report_type?.name || 'Not specified'}
                                                    </p>
                                                    {report.report_type?.category && (
                                                        <Badge variant="outline" className="mt-1 text-xs">
                                                            {report.report_type.category}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div>
                                                    <Label className="text-xs sm:text-sm font-medium text-gray-500">Report Number</Label>
                                                    <p className="mt-1 text-sm sm:text-base font-mono truncate">
                                                        {report.report_number || 'N/A'}
                                                    </p>
                                                </div>
                                                <div className="md:col-span-2">
                                                    <Label className="text-xs sm:text-sm font-medium text-gray-500">Title</Label>
                                                    <p className="mt-1 text-base sm:text-lg font-semibold break-words">{report.title || 'No title'}</p>
                                                </div>
                                                <div className="md:col-span-2">
                                                    <Label className="text-xs sm:text-sm font-medium text-gray-500">Description</Label>
                                                    <div className="mt-1 p-3 bg-gray-50 rounded-md max-h-40 overflow-y-auto">
                                                        <p className="text-sm sm:text-base whitespace-pre-line break-words">
                                                            {report.description || 'No description provided'}
                                                        </p>
                                                    </div>
                                                </div>
                                                {report.detailed_description && (
                                                    <div className="md:col-span-2">
                                                        <Label className="text-xs sm:text-sm font-medium text-gray-500">Detailed Description</Label>
                                                        <div className="mt-1 p-3 bg-gray-50 rounded-md max-h-40 overflow-y-auto">
                                                            <p className="text-sm sm:text-base whitespace-pre-line break-words">
                                                                {report.detailed_description}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <Separator />

                                            {/* Location and Date Information */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label className="text-xs sm:text-sm font-medium text-gray-500 flex items-center gap-2">
                                                        <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                                                        Location
                                                    </Label>
                                                    <p className="mt-1 text-sm sm:text-base break-words">{report.location || 'Not specified'}</p>
                                                </div>
                                                <div>
                                                    <Label className="text-xs sm:text-sm font-medium text-gray-500 flex items-center gap-2">
                                                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                                                        Incident Date
                                                    </Label>
                                                    <p className="mt-1 text-sm sm:text-base">{formatDate(report.incident_date)}</p>
                                                    {report.incident_time && (
                                                        <p className="text-xs sm:text-sm text-gray-500">Time: {formatTime(report.incident_time)}</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Impact and Safety Information */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label className="text-xs sm:text-sm font-medium text-gray-500 flex items-center gap-2">
                                                        {getImpactIcon(report.impact_level)}
                                                        <span className="truncate">Impact Level</span>
                                                    </Label>
                                                    <Badge variant="outline" className={`mt-1 text-xs capitalize ${getImpactColor(report.impact_level)}`}>
                                                        {report.impact_level}
                                                    </Badge>
                                                </div>
                                                <div>
                                                    <Label className="text-xs sm:text-sm font-medium text-gray-500 flex items-center gap-2">
                                                        {getAffectedPeopleIcon(report.affected_people)}
                                                        <span className="truncate">Affected People</span>
                                                    </Label>
                                                    <Badge variant="outline" className="mt-1 text-xs capitalize">
                                                        {report.affected_people}
                                                    </Badge>
                                                    {report.estimated_affected_count && (
                                                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                                                            Estimated count: {report.estimated_affected_count}
                                                        </p>
                                                    )}
                                                </div>
                                                {report.noise_level && (
                                                    <div>
                                                        <Label className="text-xs sm:text-sm font-medium text-gray-500 flex items-center gap-2">
                                                            {getNoiseLevelIcon(report.noise_level)}
                                                            <span className="truncate">Noise Level</span>
                                                        </Label>
                                                        <Badge variant="outline" className={`mt-1 text-xs capitalize ${getNoiseLevelColor(report.noise_level)}`}>
                                                            {report.noise_level}
                                                        </Badge>
                                                    </div>
                                                )}
                                                {report.duration_hours && (
                                                    <div>
                                                        <Label className="text-xs sm:text-sm font-medium text-gray-500 flex items-center gap-2">
                                                            <Timer className="h-3 w-3 sm:h-4 sm:w-4" />
                                                            <span className="truncate">Duration</span>
                                                        </Label>
                                                        <p className="mt-1 text-sm sm:text-base">{report.duration_hours} hours</p>
                                                    </div>
                                                )}
                                                <div className="md:col-span-2">
                                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
                                                        {report.safety_concern && (
                                                            <div className="flex items-center gap-2">
                                                                <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
                                                                <span className="text-xs sm:text-sm">Safety Concern</span>
                                                            </div>
                                                        )}
                                                        {report.environmental_impact && (
                                                            <div className="flex items-center gap-2">
                                                                <TreePine className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                                                                <span className="text-xs sm:text-sm">Environmental Impact</span>
                                                            </div>
                                                        )}
                                                        {report.recurring_issue && (
                                                            <div className="flex items-center gap-2">
                                                                <Repeat className="h-3 w-3 sm:h-4 sm:w-4 text-amber-500" />
                                                                <span className="text-xs sm:text-sm">Recurring Issue</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Previous Report */}
                                            {report.has_previous_report && report.previous_report && (
                                                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <History className="h-4 w-4 text-amber-600" />
                                                        <p className="text-sm font-medium text-amber-800">Previous Related Report</p>
                                                    </div>
                                                    <Link 
                                                        href={route('admin.community-reports.show', report.previous_report.id)}
                                                        className="block p-2 bg-white rounded-md hover:bg-gray-50 transition-colors"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <p className="font-medium text-sm">{report.previous_report.title}</p>
                                                                <p className="text-xs text-gray-500 mt-1">#{report.previous_report.report_number}</p>
                                                            </div>
                                                            <Badge className={getStatusColor(report.previous_report.status)}>
                                                                {report.previous_report.status}
                                                            </Badge>
                                                        </div>
                                                    </Link>
                                                </div>
                                            )}

                                            {/* Additional Information */}
                                            {report.perpetrator_details && (
                                                <div>
                                                    <Label className="text-xs sm:text-sm font-medium text-gray-500">Perpetrator Details</Label>
                                                    <div className="mt-1 p-3 bg-gray-50 rounded-md max-h-32 overflow-y-auto">
                                                        <p className="text-sm sm:text-base whitespace-pre-line break-words">
                                                            {report.perpetrator_details}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {report.preferred_resolution && (
                                                <div>
                                                    <Label className="text-xs sm:text-sm font-medium text-gray-500">Preferred Resolution</Label>
                                                    <div className="mt-1 p-3 bg-gray-50 rounded-md max-h-32 overflow-y-auto">
                                                        <p className="text-sm sm:text-base whitespace-pre-line break-words">
                                                            {report.preferred_resolution}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>

                                    {/* Reporter Information */}
                                    {!report.is_anonymous && report.user ? (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-lg sm:text-xl">Reporter Information</CardTitle>
                                                <CardDescription className="text-sm sm:text-base">
                                                    Details of the resident who submitted the report
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-full bg-gray-100 shrink-0">
                                                        <User className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="font-medium truncate">{getFullName(report.user)}</p>
                                                        <p className="text-xs sm:text-sm text-gray-500 truncate">
                                                            {report.user.purok ? `Purok ${report.user.purok}` : 'No purok specified'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {report.user.contact_number && (
                                                        <div>
                                                            <Label className="text-xs sm:text-sm font-medium text-gray-500 flex items-center gap-2">
                                                                <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
                                                                <span className="truncate">Contact Number</span>
                                                            </Label>
                                                            <p className="mt-1 text-sm sm:text-base truncate">{report.user.contact_number}</p>
                                                        </div>
                                                    )}
                                                    {report.user.email && (
                                                        <div>
                                                            <Label className="text-xs sm:text-sm font-medium text-gray-500 flex items-center gap-2">
                                                                <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
                                                                <span className="truncate">Email</span>
                                                            </Label>
                                                            <p className="mt-1 text-sm sm:text-base truncate">{report.user.email}</p>
                                                        </div>
                                                    )}
                                                    {report.user.address && (
                                                        <div className="md:col-span-2">
                                                            <Label className="text-xs sm:text-sm font-medium text-gray-500 flex items-center gap-2">
                                                                <Home className="h-3 w-3 sm:h-4 sm:w-4" />
                                                                <span className="truncate">Address</span>
                                                            </Label>
                                                            <p className="mt-1 text-sm sm:text-base break-words">{report.user.address}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                            <CardFooter className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                                                {report.user.contact_number && (
                                                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                                                        <PhoneCall className="h-4 w-4 mr-2" />
                                                        Call Reporter
                                                    </Button>
                                                )}
                                                {report.user.email && (
                                                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                                                        <MailIcon className="h-4 w-4 mr-2" />
                                                        Send Email
                                                    </Button>
                                                )}
                                            </CardFooter>
                                        </Card>
                                    ) : report.is_anonymous && (report.reporter_name || report.reporter_contact || report.reporter_address) ? (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                                                    <EyeOff className="h-5 w-5" />
                                                    Anonymous Reporter
                                                </CardTitle>
                                                <CardDescription className="text-sm sm:text-base">
                                                    Limited contact information provided
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                {report.reporter_name && (
                                                    <div>
                                                        <Label className="text-xs sm:text-sm font-medium text-gray-500">Name</Label>
                                                        <p className="mt-1 text-sm sm:text-base">{report.reporter_name}</p>
                                                    </div>
                                                )}
                                                {report.reporter_contact && (
                                                    <div>
                                                        <Label className="text-xs sm:text-sm font-medium text-gray-500">Contact</Label>
                                                        <p className="mt-1 text-sm sm:text-base">{report.reporter_contact}</p>
                                                    </div>
                                                )}
                                                {report.reporter_address && (
                                                    <div>
                                                        <Label className="text-xs sm:text-sm font-medium text-gray-500">Address</Label>
                                                        <p className="mt-1 text-sm sm:text-base">{report.reporter_address}</p>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ) : (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                                                    <Shield className="h-5 w-5" />
                                                    Completely Anonymous
                                                </CardTitle>
                                                <CardDescription className="text-sm sm:text-base">
                                                    No contact information provided
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex items-start gap-3 text-amber-600">
                                                    <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
                                                    <p className="text-sm">
                                                        This report was submitted completely anonymously. No personal information is available.
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}
                                </TabsContent>

                                {/* Evidence Tab */}
                                <TabsContent value="evidence" className="space-y-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg sm:text-xl">Evidence Files</CardTitle>
                                            <CardDescription className="text-sm sm:text-base">
                                                Attached evidence and documentation
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            {report.evidences && report.evidences.length > 0 ? (
                                                <div className="space-y-4">
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                        {report.evidences.map((evidence) => {
                                                            const isImage = evidence.file_type?.includes('image') || /\.(jpg|jpeg|png|gif|webp)$/i.test(evidence.file_name);
                                                            const isVideo = evidence.file_type?.includes('video') || /\.(mp4|mov|avi|wmv)$/i.test(evidence.file_name);
                                                            const fileUrl = evidence.url || `/storage/${evidence.file_path}`;
                                                            
                                                            return (
                                                                <div key={evidence.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                                                                    <div className="p-4">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="p-2 rounded-lg bg-gray-100 shrink-0">
                                                                                {isImage ? (
                                                                                    <FileImage className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                                                                                ) : isVideo ? (
                                                                                    <FileVideo className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                                                                                ) : (
                                                                                    <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
                                                                                )}
                                                                            </div>
                                                                            <div className="flex-1 min-w-0">
                                                                                <p className="text-sm font-medium truncate">
                                                                                    {evidence.file_name}
                                                                                </p>
                                                                                <p className="text-xs text-gray-500">
                                                                                    {isImage ? 'Image' : isVideo ? 'Video' : 'Document'}
                                                                                </p>
                                                                                <p className="text-xs text-gray-500">
                                                                                    {(evidence.file_size / 1024).toFixed(1)} KB
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="bg-gray-50 px-4 py-2 flex justify-end gap-2">
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() => window.open(fileUrl, '_blank')}
                                                                            className="text-blue-600 hover:text-blue-700 text-xs"
                                                                        >
                                                                            <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                                                            View
                                                                        </Button>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() => {
                                                                                const a = document.createElement('a');
                                                                                a.href = fileUrl;
                                                                                a.download = evidence.file_name;
                                                                                a.click();
                                                                            }}
                                                                            className="text-green-600 hover:text-green-700 text-xs"
                                                                        >
                                                                            <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                                                            Download
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center py-8">
                                                    <Paperclip className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                                        No Evidence Files
                                                    </h3>
                                                    <p className="text-gray-500">
                                                        No evidence files have been attached to this report.
                                                    </p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                {/* Activity Tab */}
                                <TabsContent value="activity" className="space-y-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg sm:text-xl">Activity Log</CardTitle>
                                            <CardDescription className="text-sm sm:text-base">
                                                Timeline of all actions taken on this report
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            {activity_logs && activity_logs.length > 0 ? (
                                                <div className="space-y-4">
                                                    {activity_logs.map((log, index) => {
                                                        const logId = log?.id || index;
                                                        const action = log?.action || '';
                                                        const userName = log?.user_name || 'Unknown User';
                                                        const details = log?.details || 'No details provided';
                                                        const createdAt = log?.created_at || '';
                                                        const ipAddress = log?.ip_address;

                                                        return (
                                                            <div key={logId} className="flex gap-3 sm:gap-4">
                                                                <div className="flex flex-col items-center">
                                                                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                                                                        safeIncludes(action, 'created') ? 'bg-green-100 text-green-600' :
                                                                        safeIncludes(action, 'updated') ? 'bg-blue-100 text-blue-600' :
                                                                        safeIncludes(action, 'deleted') ? 'bg-red-100 text-red-600' :
                                                                        safeIncludes(action, 'resolved') ? 'bg-green-100 text-green-600' :
                                                                        safeIncludes(action, 'assigned') ? 'bg-purple-100 text-purple-600' :
                                                                        safeIncludes(action, 'viewed') ? 'bg-gray-100 text-gray-600' :
                                                                        'bg-gray-100 text-gray-600'
                                                                    }`}>
                                                                        {safeIncludes(action, 'created') ? <Plus className="h-3 w-3 sm:h-4 sm:w-4" /> :
                                                                         safeIncludes(action, 'updated') ? <Edit className="h-3 w-3 sm:h-4 sm:w-4" /> :
                                                                         safeIncludes(action, 'deleted') ? <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" /> :
                                                                         safeIncludes(action, 'resolved') ? <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" /> :
                                                                         safeIncludes(action, 'assigned') ? <UserCheck className="h-3 w-3 sm:h-4 sm:w-4" /> :
                                                                         safeIncludes(action, 'viewed') ? <Eye className="h-3 w-3 sm:h-4 sm:w-4" /> :
                                                                         <History className="h-3 w-3 sm:h-4 sm:w-4" />}
                                                                    </div>
                                                                    {index < activity_logs.length - 1 && (
                                                                        <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
                                                                    )}
                                                                </div>
                                                                <div className="flex-1 pb-4 min-w-0">
                                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                                                        <p className="font-medium text-sm sm:text-base truncate">{userName}</p>
                                                                        <p className="text-xs sm:text-sm text-gray-500 shrink-0">{getTimeAgo(createdAt)}</p>
                                                                    </div>
                                                                    <p className="text-xs sm:text-sm text-gray-600 mt-1 break-words">{details}</p>
                                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-2 text-xs text-gray-500">
                                                                        <span>{formatDateTime(createdAt)}</span>
                                                                        {ipAddress && (
                                                                            <span>IP: {ipAddress}</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="text-center py-8">
                                                    <History className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                                        No Activity Logs
                                                    </h3>
                                                    <p className="text-gray-500">
                                                        No activity has been recorded for this report yet.
                                                    </p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </Tabs>
                        </div>

                        {/* Right Column - Sidebar */}
                        <div className="space-y-6">
                            {/* Resolution Notes */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg sm:text-xl">Resolution Notes</CardTitle>
                                    <CardDescription className="text-sm sm:text-base">
                                        Internal notes and resolution details
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Textarea
                                        value={adminNotes}
                                        onChange={(e) => setAdminNotes(e.target.value)}
                                        placeholder="Add resolution notes here..."
                                        className="min-h-[150px] sm:min-h-[200px] text-sm sm:text-base"
                                    />
                                </CardContent>
                                <CardFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between">
                                    <div className="text-xs sm:text-sm text-gray-500 order-2 sm:order-1">
                                        {adminNotes.length} characters
                                    </div>
                                    <Button
                                        onClick={handleSaveNotes}
                                        disabled={isSavingNotes || adminNotes === (report?.resolution_notes || '')}
                                        className="w-full sm:w-auto order-1 sm:order-2"
                                        size="sm"
                                    >
                                        {isSavingNotes ? (
                                            <>
                                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            'Save Notes'
                                        )}
                                    </Button>
                                </CardFooter>
                            </Card>

                     {/* Staff Assignment */}
<Card>
    <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Staff Assignment</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
        {report.assignedTo ? (
            <div>
                <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-medium">Currently Assigned</Label>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleUnassignStaff}
                        className="h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                        <X className="h-3 w-3 mr-1" />
                        Unassign
                    </Button>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg bg-blue-50">
                    <div className="p-2 rounded-full bg-blue-100 shrink-0">
                        <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        {/* Fix: Handle different possible name formats */}
                        <p className="font-medium truncate">
                            {report.assignedTo.name || 
                             (report.assignedTo.first_name && report.assignedTo.last_name 
                                ? `${report.assignedTo.first_name} ${report.assignedTo.last_name}`.trim()
                                : report.assignedTo.first_name || 
                                  report.assignedTo.last_name || 
                                  'Unknown Staff')}
                        </p>
                        
                        {/* Email */}
                        {report.assignedTo.email && (
                            <p className="text-xs text-gray-600 truncate flex items-center gap-1 mt-1">
                                <Mail className="h-3 w-3" />
                                {report.assignedTo.email}
                            </p>
                        )}
                        
                        {/* Contact Number */}
                        {report.assignedTo.phone || report.assignedTo.contact_number ? (
                            <p className="text-xs text-gray-600 truncate flex items-center gap-1 mt-1">
                                <Phone className="h-3 w-3" />
                                {report.assignedTo.phone || report.assignedTo.contact_number}
                            </p>
                        ) : null}
                        
                        {/* Position */}
                        {report.assignedTo.position && (
                            <p className="text-xs text-gray-500 truncate mt-1">
                                Position: {report.assignedTo.position}
                            </p>
                        )}
                        
                        {/* Role */}
                        {report.assignedTo.role && (
                            <Badge variant="outline" className="mt-2 text-xs">
                                {report.assignedTo.role}
                            </Badge>
                        )}
                    </div>
                </div>
            </div>
        ) : (
            <div>
                <Label className="text-sm font-medium mb-3 block">Not Assigned</Label>
                <div className="p-4 border border-dashed rounded-lg text-center">
                    <User className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-3">No staff assigned to this report</p>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAssignToStaff}
                        className="w-full"
                    >
                        <UserCheck className="h-4 w-4 mr-2" />
                        Assign Staff
                    </Button>
                </div>
            </div>
        )}
        
        {/* Quick Assign Suggestions */}
        {staff.length > 0 && !report.assignedTo && (
            <div className="pt-4 border-t">
                <Label className="text-sm font-medium mb-2 block">Quick Assign</Label>
                <div className="space-y-2">
                    {staff.slice(0, 3).map((staffMember) => (
                        <Button
                            key={staffMember.id}
                            variant="outline"
                            className="w-full justify-start text-sm"
                            onClick={() => {
                                router.put(route('admin.community-reports.update', report.id), {
                                    assigned_to: staffMember.id,
                                    status: 'assigned'
                                }, {
                                    preserveScroll: true,
                                });
                            }}
                            size="sm"
                        >
                            <User className="h-4 w-4 mr-2" />
                            <div className="flex-1 text-left truncate">
                                <span className="font-medium truncate">{staffMember.name}</span>
                                {staffMember.position && (
                                    <span className="text-xs text-gray-500 ml-2 truncate hidden sm:inline">
                                        • {staffMember.position}
                                    </span>
                                )}
                            </div>
                            {staffMember.role && (
                                <Badge variant="secondary" className="ml-auto text-xs shrink-0">
                                    {staffMember.role}
                                </Badge>
                            )}
                        </Button>
                    ))}
                    {staff.length > 3 && (
                        <Button
                            variant="ghost"
                            className="w-full text-sm"
                            onClick={handleAssignToStaff}
                            size="sm"
                        >
                            <Plus className="h-3 w-3 mr-1" />
                            View all {staff.length} staff members
                        </Button>
                    )}
                </div>
            </div>
        )}
    </CardContent>
</Card>

                            {/* Quick Actions */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg sm:text-xl">Quick Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start text-sm"
                                        onClick={handleSendResponse}
                                        size="sm"
                                    >
                                        <Send className="h-4 w-4 mr-2" />
                                        Send Response
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start text-sm"
                                        onClick={() => router.visit(route('admin.community-reports.related', report.id))}
                                        size="sm"
                                    >
                                        <Layers className="h-4 w-4 mr-2" />
                                        View Related Reports
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Timeline Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg sm:text-xl">Timeline</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label className="text-xs sm:text-sm font-medium text-gray-500">Report Created</Label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                                            <p className="text-xs sm:text-sm">{formatDateTime(report.created_at)}</p>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {getTimeAgo(report.created_at)}
                                        </p>
                                    </div>

                                    <div>
                                        <Label className="text-xs sm:text-sm font-medium text-gray-500">Last Updated</Label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                                            <p className="text-xs sm:text-sm">{formatDateTime(report.updated_at)}</p>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {getTimeAgo(report.updated_at)}
                                        </p>
                                    </div>

                                    {report.acknowledged_at && (
                                        <div>
                                            <Label className="text-xs sm:text-sm font-medium text-gray-500">Acknowledged</Label>
                                            <div className="flex items-center gap-2 mt-1">
                                                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-400" />
                                                <p className="text-xs sm:text-sm">{formatDateTime(report.acknowledged_at)}</p>
                                            </div>
                                        </div>
                                    )}

                                    {report.resolved_at && (
                                        <div>
                                            <Label className="text-xs sm:text-sm font-medium text-gray-500">Resolved</Label>
                                            <div className="flex items-center gap-2 mt-1">
                                                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-400" />
                                                <p className="text-xs sm:text-sm">{formatDateTime(report.resolved_at)}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <Label className="text-xs sm:text-sm font-medium text-gray-500">Response Time</Label>
                                        <p className="mt-1 text-xs sm:text-sm">{calculateResponseTime()}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* System Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg sm:text-xl">System Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div>
                                        <Label className="text-xs sm:text-sm font-medium text-gray-500">Report ID</Label>
                                        <p className="text-xs sm:text-sm font-mono mt-1 truncate">{report.report_number || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <Label className="text-xs sm:text-sm font-medium text-gray-500">Database ID</Label>
                                        <p className="text-xs sm:text-sm font-mono mt-1">#{report.id}</p>
                                    </div>
                                    <div>
                                        <Label className="text-xs sm:text-sm font-medium text-gray-500">Report Type ID</Label>
                                        <p className="text-xs sm:text-sm font-mono mt-1">#{report.report_type?.id || 'N/A'}</p>
                                    </div>
                                    {report.has_previous_report && report.previous_report_id && (
                                        <div>
                                            <Label className="text-xs sm:text-sm font-medium text-gray-500">Previous Report</Label>
                                            <p className="text-xs sm:text-sm font-mono mt-1">#{report.previous_report_id}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Similar Reports */}
                            {similar_reports && similar_reports.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg sm:text-xl">Similar Reports</CardTitle>
                                        <CardDescription className="text-sm sm:text-base">
                                            Recently reported similar issues
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {similar_reports.slice(0, 3).map((similar) => (
                                            <Link
                                                key={similar.id}
                                                href={route('admin.community-reports.show', similar.id)}
                                                className="block"
                                            >
                                                <div className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <Badge className={`${getStatusColor(similar.status)} text-xs`}>
                                                                {similar.status?.charAt(0).toUpperCase()}
                                                            </Badge>
                                                            <span className="text-xs sm:text-sm font-medium truncate">#{similar.report_number}</span>
                                                        </div>
                                                        <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
                                                    </div>
                                                    <p className="text-xs sm:text-sm text-gray-600 mt-1 truncate">{similar.title}</p>
                                                    <p className="text-xs text-gray-500 mt-1">{formatDate(similar.created_at)}</p>
                                                </div>
                                            </Link>
                                        ))}
                                        {similar_reports.length > 3 && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="w-full text-xs sm:text-sm"
                                                onClick={() => router.visit(route('admin.community-reports.related', report.id))}
                                            >
                                                View All ({similar_reports.length})
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </TooltipProvider>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Community Report</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete community report #{report.report_number}?
                            This action cannot be undone. All associated data including evidence files and activity logs will be permanently removed.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <>
                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                'Delete Report'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Assign to Staff Dialog */}
            <AlertDialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
                <AlertDialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Assign to Staff</AlertDialogTitle>
                        <AlertDialogDescription>
                            Select a barangay official to assign this report to. Only active non-resident users are listed.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    
                    <div className="flex-1 overflow-y-auto py-4">
                        {/* Search Bar */}
                        <div className="mb-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search staff by name, email, phone, position, or role..."
                                    value={staffSearch}
                                    onChange={(e) => setStaffSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                            </div>
                        </div>

                        {/* Staff List */}
                        <div className="space-y-2">
                            {filteredStaff.length === 0 ? (
                                <div className="text-center py-8">
                                    <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                        {staffSearch ? 'No Matching Staff Found' : 'No Staff Available'}
                                    </h3>
                                    <p className="text-gray-500">
                                        {staffSearch 
                                            ? 'Try a different search term' 
                                            : 'No active barangay officials with assigned roles are currently available.'}
                                    </p>
                                </div>
                            ) : (
                                filteredStaff.map((staffMember) => (
                                    <div
                                        key={staffMember.id}
                                        className={`p-4 border rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${
                                            selectedStaff === staffMember.id 
                                                ? 'border-blue-500 bg-blue-50' 
                                                : 'border-gray-200'
                                        }`}
                                        onClick={() => setSelectedStaff(staffMember.id)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex-shrink-0">
                                                {staffMember.avatar ? (
                                                    <img
                                                        src={staffMember.avatar}
                                                        alt={staffMember.name}
                                                        className="h-10 w-10 rounded-full"
                                                    />
                                                ) : staffMember.initials ? (
                                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                        <span className="font-semibold text-blue-600">
                                                            {staffMember.initials}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                        <User className="h-5 w-5 text-blue-600" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium truncate">{staffMember.name}</p>
                                                    {selectedStaff === staffMember.id && (
                                                        <Check className="h-4 w-4 text-green-600 shrink-0" />
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-gray-600">
                                                    {staffMember.position && (
                                                        <Badge variant="outline" className="text-xs bg-gray-100">
                                                            {staffMember.position}
                                                        </Badge>
                                                    )}
                                                    {staffMember.role && (
                                                        <Badge variant="outline" className="text-xs">
                                                            {staffMember.role}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-500">
                                                    {staffMember.email && (
                                                        <span className="flex items-center gap-1 truncate">
                                                            <Mail className="h-3 w-3" />
                                                            <span className="truncate">{staffMember.email}</span>
                                                        </span>
                                                    )}
                                                    {staffMember.phone && (
                                                        <span className="flex items-center gap-1 truncate">
                                                            <Phone className="h-3 w-3" />
                                                            <span className="truncate">{staffMember.phone}</span>
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Assignment Notes */}
                        <div className="mt-6">
                            <Label htmlFor="assign-notes" className="text-sm font-medium mb-2 block">
                                Assignment Notes (Optional)
                            </Label>
                            <Textarea
                                id="assign-notes"
                                placeholder="Add notes about this assignment..."
                                value={assignNotes}
                                onChange={(e) => setAssignNotes(e.target.value)}
                                className="min-h-[100px] text-sm"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                These notes will be added to the resolution notes.
                            </p>
                        </div>

                        {/* Selected Staff Preview */}
                        {selectedStaffMember && (
                            <div className="mt-4 p-4 border border-blue-200 rounded-lg bg-blue-50">
                                <div className="flex items-center justify-between mb-2">
                                    <Label className="text-sm font-medium text-blue-700">Selected Staff</Label>
                                    <Badge variant="outline" className="bg-white">
                                        Ready to assign
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-3">
                                    {selectedStaffMember.avatar ? (
                                        <img
                                            src={selectedStaffMember.avatar}
                                            alt={selectedStaffMember.name}
                                            className="h-8 w-8 rounded-full"
                                        />
                                    ) : selectedStaffMember.initials ? (
                                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                            <span className="font-semibold text-blue-600 text-xs">
                                                {selectedStaffMember.initials}
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                            <User className="h-4 w-4 text-blue-600" />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{selectedStaffMember.name}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            {selectedStaffMember.position && (
                                                <span className="text-xs text-gray-600">{selectedStaffMember.position}</span>
                                            )}
                                            {selectedStaffMember.role && (
                                                <span className="text-xs text-gray-500">{selectedStaffMember.role}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <AlertDialogFooter className="pt-4 border-t">
                        <AlertDialogCancel disabled={isAssigning}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleAssignSubmit}
                            disabled={isAssigning || !selectedStaff}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {isAssigning ? (
                                <>
                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                    Assigning...
                                </>
                            ) : (
                                <>
                                    <UserCheck className="mr-2 h-4 w-4" />
                                    Assign Report
                                </>
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}