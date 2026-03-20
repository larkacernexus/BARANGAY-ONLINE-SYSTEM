// resources/js/Pages/Admin/CommunityReports/Show.tsx

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
    History as HistoryIcon,
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
    AlertOctagon as AlertOctagonIcon,
    FileVideo,
    Loader2
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
        username?: string; // Added username field
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
        username?: string; // Added username field
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
    username?: string; // Added username field
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
            return <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />;
        case 'in_progress':
            return <Clock className="h-5 w-5 text-blue-500 dark:text-blue-400" />;
        case 'under_review':
            return <Eye className="h-5 w-5 text-amber-500 dark:text-amber-400" />;
        case 'assigned':
            return <UserCheck className="h-5 w-5 text-purple-500 dark:text-purple-400" />;
        case 'pending':
            return <AlertCircle className="h-5 w-5 text-amber-500 dark:text-amber-400" />;
        case 'rejected':
            return <X className="h-5 w-5 text-red-500 dark:text-red-400" />;
        default:
            return <AlertCircle className="h-5 w-5" />;
    }
};

const getPriorityIcon = (priority: string | null | undefined) => {
    switch (priority) {
        case 'critical':
            return <AlertTriangle className="h-5 w-5 text-red-500 dark:text-red-400" />;
        case 'high':
            return <AlertTriangle className="h-5 w-5 text-orange-500 dark:text-orange-400" />;
        case 'medium':
            return <AlertCircle className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />;
        case 'low':
            return <Info className="h-5 w-5 text-blue-500 dark:text-blue-400" />;
        default:
            return <Clock className="h-5 w-5" />;
    }
};

const getUrgencyIcon = (urgency: string | null | undefined) => {
    switch (urgency) {
        case 'high':
            return <Zap className="h-4 w-4 text-red-500 dark:text-red-400" />;
        case 'medium':
            return <Zap className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />;
        case 'low':
            return <Zap className="h-4 w-4 text-green-500 dark:text-green-400" />;
        default:
            return <Zap className="h-4 w-4" />;
    }
};

const getImpactIcon = (impact: string | null | undefined) => {
    switch (impact) {
        case 'severe':
            return <AlertOctagonIcon className="h-4 w-4 text-red-500 dark:text-red-400" />;
        case 'high':
            return <AlertTriangle className="h-4 w-4 text-orange-500 dark:text-orange-400" />;
        case 'moderate':
            return <AlertCircle className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />;
        case 'low':
            return <Info className="h-4 w-4 text-blue-500 dark:text-blue-400" />;
        default:
            return <AlertCircle className="h-4 w-4" />;
    }
};

const getNoiseLevelIcon = (noise: string | null | undefined) => {
    switch (noise) {
        case 'severe':
            return <Mic className="h-4 w-4 text-red-500 dark:text-red-400" />;
        case 'high':
            return <Volume2 className="h-4 w-4 text-orange-500 dark:text-orange-400" />;
        case 'moderate':
            return <Volume className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />;
        case 'low':
            return <VolumeX className="h-4 w-4 text-green-500 dark:text-green-400" />;
        default:
            return <Volume className="h-4 w-4" />;
    }
};

const getStatusColor = (status: string | null | undefined): string => {
    switch (status) {
        case 'resolved': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
        case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
        case 'under_review': return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800';
        case 'assigned': return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800';
        case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
        case 'rejected': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
        default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700';
    }
};

const getPriorityColor = (priority: string | null | undefined): string => {
    switch (priority) {
        case 'critical': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
        case 'high': return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800';
        case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
        case 'low': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
        default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700';
    }
};

const getUrgencyColor = (urgency: string | null | undefined): string => {
    switch (urgency) {
        case 'high': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
        case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
        case 'low': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
        default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700';
    }
};

const getImpactColor = (impact: string | null | undefined): string => {
    switch (impact) {
        case 'severe': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
        case 'high': return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800';
        case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
        case 'low': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
        default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700';
    }
};

const getNoiseLevelColor = (noise: string | null | undefined): string => {
    switch (noise) {
        case 'severe': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
        case 'high': return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800';
        case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
        case 'low': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
        default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700';
    }
};

// Format status text safely
const formatStatusText = (status: string | null | undefined): string => {
    if (!status) return 'Unknown';
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
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

// Get display name - prioritizes username, then full name, then fallback
const getDisplayName = (person: { username?: string; first_name?: string; last_name?: string; name?: string; role?: string }): string => {
    // If username exists, use it
    if (person.username) {
        return person.username;
    }
    
    // Try to construct full name from first_name and last_name
    if (person.first_name && person.last_name) {
        return `${person.first_name} ${person.last_name}`.trim();
    }
    
    // If name field exists, use it
    if (person.name) {
        return person.name;
    }
    
    // If first_name alone exists
    if (person.first_name) {
        return person.first_name;
    }
    
    // If last_name alone exists
    if (person.last_name) {
        return person.last_name;
    }
    
    // If role exists, use it as fallback
    if (person.role) {
        return person.role;
    }
    
    // Ultimate fallback
    return 'Unknown User';
};

// Get full name - keeps original for compatibility
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
                    <AlertCircle className="h-16 w-16 text-amber-500 dark:text-amber-400 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Community Report Not Found</h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">The community report you are looking for does not exist or has been removed.</p>
                    <Link href={route('admin.community-reports.index')}>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
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
        const displayName = selectedStaffMember ? getDisplayName(selectedStaffMember) : 'Unknown Staff';
        const notesPrefix = `[Assigned to ${displayName} on ${new Date().toLocaleDateString()}]`;
        
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
        staffMember.name?.toLowerCase().includes(staffSearch.toLowerCase()) ||
        (staffMember.first_name && staffMember.first_name.toLowerCase().includes(staffSearch.toLowerCase())) ||
        (staffMember.last_name && staffMember.last_name.toLowerCase().includes(staffSearch.toLowerCase())) ||
        (staffMember.username && staffMember.username.toLowerCase().includes(staffSearch.toLowerCase())) ||
        staffMember.email?.toLowerCase().includes(staffSearch.toLowerCase()) ||
        staffMember.phone?.toLowerCase().includes(staffSearch.toLowerCase()) ||
        staffMember.position?.toLowerCase().includes(staffSearch.toLowerCase()) ||
        staffMember.role?.toLowerCase().includes(staffSearch.toLowerCase())
    );

    // Get selected staff member details
    const selectedStaffMember = selectedStaff ? staff.find(s => s.id === selectedStaff) : null;

    // Get status banner based on overdue or expiring
    const getStatusBanner = () => {
        if (report.status === 'resolved') return null;
        
        const created = report.created_at ? new Date(report.created_at) : null;
        if (!created) return null;
        
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays > 7 && report.priority === 'critical') {
            return {
                color: 'red',
                icon: <AlertTriangle className="h-5 w-5 text-red-500 dark:text-red-400" />,
                title: 'Report Overdue',
                message: `This critical report has been pending for ${diffDays} days. Immediate attention required.`
            };
        } else if (diffDays > 3 && report.priority === 'high') {
            return {
                color: 'amber',
                icon: <Clock className="h-5 w-5 text-amber-500 dark:text-amber-400" />,
                title: 'Report Delayed',
                message: `This high priority report has been pending for ${diffDays} days.`
            };
        }
        
        return null;
    };

    const statusBanner = getStatusBanner();

    // Tabs definition
    const tabs = [
        { id: 'details', label: 'Details', icon: <FileText className="h-4 w-4" /> },
        { id: 'evidence', label: 'Evidence', icon: <Paperclip className="h-4 w-4" />, count: report.evidences?.length },
        { id: 'activity', label: 'Activity', icon: <HistoryIcon className="h-4 w-4" />, count: activity_logs.length },
    ];

    return (
        <>
            <Head title={`Community Report #${report.report_number || 'N/A'}`} />

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
                            <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-400 p-4 rounded-r-lg">
                                <div className="flex items-center">
                                    <CheckCircle className="h-5 w-5 text-green-400 dark:text-green-500 mr-3" />
                                    <div>
                                        <p className="text-green-800 dark:text-green-300 font-medium">Success</p>
                                        <p className="text-green-700 dark:text-green-400 text-sm mt-1">{flash.success}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {flash?.error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 p-4 rounded-r-lg">
                                <div className="flex items-center">
                                    <AlertCircle className="h-5 w-5 text-red-400 dark:text-red-500 mr-3" />
                                    <div>
                                        <p className="text-red-800 dark:text-red-300 font-medium">Error</p>
                                        <p className="text-red-700 dark:text-red-400 text-sm mt-1">{flash.error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Header with Actions - EXACT same as Forms */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <Link href={route('admin.community-reports.index')}>
                                    <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-300">
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Back to Reports
                                    </Button>
                                </Link>
                                <div className="flex items-center gap-3">
                                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center shadow-lg ${
                                        report.status === 'resolved'
                                            ? 'bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-700 dark:to-emerald-700'
                                            : report.status === 'in_progress'
                                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700'
                                            : report.status === 'under_review'
                                            ? 'bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-700 dark:to-orange-700'
                                            : report.status === 'assigned'
                                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-700 dark:to-pink-700'
                                            : report.status === 'rejected'
                                            ? 'bg-gradient-to-r from-red-600 to-rose-600 dark:from-red-700 dark:to-rose-700'
                                            : 'bg-gradient-to-r from-gray-600 to-slate-600 dark:from-gray-700 dark:to-slate-700'
                                    }`}>
                                        <FileText className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight dark:text-gray-100">
                                            Community Report
                                        </h1>
                                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                                            <Badge variant="outline" className={`flex items-center gap-1 ${getStatusColor(report.status)}`}>
                                                {getStatusIcon(report.status)}
                                                <span className="ml-1">{formatStatusText(report.status)}</span>
                                            </Badge>
                                            <Badge variant="outline" className="flex items-center gap-1 bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800">
                                                <Hash className="h-3 w-3" />
                                                {report.report_number || 'N/A'}
                                            </Badge>
                                            <Badge variant="outline" className={`flex items-center gap-1 ${getPriorityColor(report.priority)}`}>
                                                {getPriorityIcon(report.priority)}
                                                <span className="ml-1 capitalize">{report.priority}</span>
                                            </Badge>
                                            <Badge variant="outline" className={`flex items-center gap-1 ${getUrgencyColor(report.urgency_level)}`}>
                                                {getUrgencyIcon(report.urgency_level)}
                                                <span className="ml-1 capitalize">{report.urgency_level}</span>
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            onClick={handleCopyReportNumber}
                                            disabled={!report.report_number}
                                            className="dark:border-gray-600 dark:text-gray-300"
                                        >
                                            {copied ? (
                                                <Check className="h-4 w-4 mr-2 text-green-600 dark:text-green-400" />
                                            ) : (
                                                <Copy className="h-4 w-4 mr-2" />
                                            )}
                                            {copied ? 'Copied!' : 'Copy ID'}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Copy report number</TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            onClick={handlePrint}
                                            className="dark:border-gray-600 dark:text-gray-300"
                                        >
                                            <Printer className="h-4 w-4 mr-2" />
                                            Print
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Print report details</TooltipContent>
                                </Tooltip>

                                <Link href={route('admin.community-reports.edit', report.id)}>
                                    <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-300">
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit
                                    </Button>
                                </Link>

                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => setShowDeleteDialog(true)}
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                </Button>
                            </div>
                        </div>

                        {/* Status Banner - EXACT same as Forms */}
                        {statusBanner && (
                            <Card className={`border-l-4 ${statusBanner.color === 'red' ? 'border-l-red-500' : 'border-l-amber-500'} dark:bg-gray-900`}>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {statusBanner.icon}
                                            <div>
                                                <p className="font-medium dark:text-gray-100">{statusBanner.title}</p>
                                                <p className={`text-sm ${statusBanner.color === 'red' ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                                    {statusBanner.message}
                                                </p>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm" onClick={handleAssignToStaff} className="dark:border-gray-600 dark:text-gray-300">
                                            <UserCheck className="h-4 w-4 mr-2" />
                                            Assign Staff
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Main Content - Grid Layout */}
                        <div className="grid gap-6 lg:grid-cols-3">
                            {/* Left Column - Main Content */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Tab Navigation - EXACT same as Forms */}
                                <div className="border-b border-gray-200 dark:border-gray-700">
                                    <nav className="flex space-x-4" aria-label="Tabs">
                                        {tabs.map((tab) => (
                                            <button
                                                key={tab.id}
                                                onClick={() => setActiveTab(tab.id as any)}
                                                className={`
                                                    inline-flex items-center px-3 py-2 text-sm font-medium border-b-2
                                                    ${activeTab === tab.id
                                                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                                                    }
                                                `}
                                            >
                                                {tab.icon}
                                                <span className="ml-2">{tab.label}</span>
                                                {tab.count ? ` (${tab.count})` : ''}
                                            </button>
                                        ))}
                                    </nav>
                                </div>

                                {/* Tab Content */}
                                <div className="pt-2">
                                    {/* Details Tab Content */}
                                    {activeTab === 'details' && (
                                        <div className="space-y-6">
                                            {/* Report Information Card */}
                                            <Card className="dark:bg-gray-900">
                                                <CardHeader>
                                                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                                                        <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 flex items-center justify-center">
                                                            <FileText className="h-3 w-3 text-white" />
                                                        </div>
                                                        Report Information
                                                    </CardTitle>
                                                    <CardDescription className="dark:text-gray-400">
                                                        Detailed information about the community report
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent className="space-y-6">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <div>
                                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Report Type</p>
                                                            <p className="text-sm font-medium dark:text-gray-200">
                                                                {report.report_type?.name || 'Not specified'}
                                                            </p>
                                                            {report.report_type?.category && (
                                                                <Badge variant="outline" className="mt-1 text-xs dark:border-gray-600 dark:text-gray-300">
                                                                    {report.report_type.category}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Report Number</p>
                                                            <p className="text-sm font-mono dark:text-gray-200">
                                                                {report.report_number || 'N/A'}
                                                            </p>
                                                        </div>
                                                        <div className="md:col-span-2">
                                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Title</p>
                                                            <p className="text-base font-semibold dark:text-gray-100">{report.title || 'No title'}</p>
                                                        </div>
                                                        <div className="md:col-span-2">
                                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Description</p>
                                                            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 max-h-40 overflow-y-auto">
                                                                <p className="text-sm whitespace-pre-line dark:text-gray-300">
                                                                    {report.description || 'No description provided'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        {report.detailed_description && (
                                                            <div className="md:col-span-2">
                                                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Detailed Description</p>
                                                                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 max-h-40 overflow-y-auto">
                                                                    <p className="text-sm whitespace-pre-line dark:text-gray-300">
                                                                        {report.detailed_description}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <Separator className="dark:bg-gray-700" />

                                                    {/* Location and Date Information */}
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <div>
                                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-1">
                                                                <MapPin className="h-3 w-3" />
                                                                Location
                                                            </p>
                                                            <p className="text-sm dark:text-gray-300">{report.location || 'Not specified'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-1">
                                                                <Calendar className="h-3 w-3" />
                                                                Incident Date
                                                            </p>
                                                            <p className="text-sm dark:text-gray-300">{formatDate(report.incident_date)}</p>
                                                            {report.incident_time && (
                                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Time: {formatTime(report.incident_time)}</p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <Separator className="dark:bg-gray-700" />

                                                    {/* Impact and Safety Information */}
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <div>
                                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-1">
                                                                {getImpactIcon(report.impact_level)}
                                                                Impact Level
                                                            </p>
                                                            <Badge variant="outline" className={`mt-1 text-xs capitalize ${getImpactColor(report.impact_level)}`}>
                                                                {report.impact_level}
                                                            </Badge>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-1">
                                                                {getAffectedPeopleIcon(report.affected_people)}
                                                                Affected People
                                                            </p>
                                                            <Badge variant="outline" className="mt-1 text-xs capitalize dark:border-gray-600 dark:text-gray-300">
                                                                {report.affected_people}
                                                            </Badge>
                                                            {report.estimated_affected_count && (
                                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                                    Estimated count: {report.estimated_affected_count}
                                                                </p>
                                                            )}
                                                        </div>
                                                        {report.noise_level && (
                                                            <div>
                                                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-1">
                                                                    {getNoiseLevelIcon(report.noise_level)}
                                                                    Noise Level
                                                                </p>
                                                                <Badge variant="outline" className={`mt-1 text-xs capitalize ${getNoiseLevelColor(report.noise_level)}`}>
                                                                    {report.noise_level}
                                                                </Badge>
                                                            </div>
                                                        )}
                                                        {report.duration_hours && (
                                                            <div>
                                                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-1">
                                                                    <Timer className="h-3 w-3" />
                                                                    Duration
                                                                </p>
                                                                <p className="mt-1 text-sm dark:text-gray-300">{report.duration_hours} hours</p>
                                                            </div>
                                                        )}
                                                        <div className="md:col-span-2">
                                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                                                {report.safety_concern && (
                                                                    <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                                                        <AlertTriangle className="h-3 w-3 text-red-500 dark:text-red-400" />
                                                                        <span className="text-xs text-red-700 dark:text-red-400">Safety Concern</span>
                                                                    </div>
                                                                )}
                                                                {report.environmental_impact && (
                                                                    <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                                                        <TreePine className="h-3 w-3 text-green-500 dark:text-green-400" />
                                                                        <span className="text-xs text-green-700 dark:text-green-400">Environmental Impact</span>
                                                                    </div>
                                                                )}
                                                                {report.recurring_issue && (
                                                                    <div className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                                                                        <Repeat className="h-3 w-3 text-amber-500 dark:text-amber-400" />
                                                                        <span className="text-xs text-amber-700 dark:text-amber-400">Recurring Issue</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Previous Report */}
                                                    {report.has_previous_report && report.previous_report && (
                                                        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <HistoryIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                                                <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Previous Related Report</p>
                                                            </div>
                                                            <Link 
                                                                href={route('admin.community-reports.show', report.previous_report.id)}
                                                                className="block p-3 bg-white dark:bg-gray-900 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
                                                            >
                                                                <div className="flex items-center justify-between">
                                                                    <div>
                                                                        <p className="font-medium text-sm dark:text-gray-200">{report.previous_report.title}</p>
                                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">#{report.previous_report.report_number}</p>
                                                                    </div>
                                                                    <Badge className={getStatusColor(report.previous_report.status)}>
                                                                        {formatStatusText(report.previous_report.status)}
                                                                    </Badge>
                                                                </div>
                                                            </Link>
                                                        </div>
                                                    )}

                                                    {/* Additional Information */}
                                                    {report.perpetrator_details && (
                                                        <div>
                                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Perpetrator Details</p>
                                                            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 max-h-32 overflow-y-auto">
                                                                <p className="text-sm whitespace-pre-line dark:text-gray-300">
                                                                    {report.perpetrator_details}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {report.preferred_resolution && (
                                                        <div>
                                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Preferred Resolution</p>
                                                            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 max-h-32 overflow-y-auto">
                                                                <p className="text-sm whitespace-pre-line dark:text-gray-300">
                                                                    {report.preferred_resolution}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>

                                            {/* Reporter Information Card - UPDATED with username and role fallback */}
                                            {!report.is_anonymous && report.user ? (
                                                <Card className="dark:bg-gray-900">
                                                    <CardHeader>
                                                        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                                                            <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-700 dark:to-pink-700 flex items-center justify-center">
                                                                <User className="h-3 w-3 text-white" />
                                                            </div>
                                                            Reporter Information
                                                        </CardTitle>
                                                        <CardDescription className="dark:text-gray-400">
                                                            Details of the resident who submitted the report
                                                        </CardDescription>
                                                    </CardHeader>
                                                    <CardContent className="space-y-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 shrink-0">
                                                                <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <p className="font-medium dark:text-gray-200">
                                                                    {getDisplayName(report.user)}
                                                                </p>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                    {report.user.purok ? `Purok ${report.user.purok}` : 'No purok specified'}
                                                                    {report.user.username && <span className="ml-2 text-blue-500 dark:text-blue-400">@{report.user.username}</span>}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {report.user.contact_number && (
                                                                <div className="flex items-center gap-2">
                                                                    <Phone className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                                                    <p className="text-sm dark:text-gray-300">{report.user.contact_number}</p>
                                                                </div>
                                                            )}
                                                            {report.user.email && (
                                                                <div className="flex items-center gap-2">
                                                                    <Mail className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                                                    <p className="text-sm dark:text-gray-300">{report.user.email}</p>
                                                                </div>
                                                            )}
                                                            {report.user.address && (
                                                                <div className="flex items-center gap-2 md:col-span-2">
                                                                    <Home className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                                                    <p className="text-sm dark:text-gray-300">{report.user.address}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </CardContent>
                                                    <CardFooter className="flex flex-col sm:flex-row gap-2 sm:justify-end border-t dark:border-gray-700 pt-4">
                                                        {report.user.contact_number && (
                                                            <a href={`tel:${report.user.contact_number}`}>
                                                                <Button variant="outline" size="sm" className="w-full sm:w-auto dark:border-gray-600 dark:text-gray-300">
                                                                    <PhoneCall className="h-4 w-4 mr-2" />
                                                                    Call Reporter
                                                                </Button>
                                                            </a>
                                                        )}
                                                        {report.user.email && (
                                                            <a href={`mailto:${report.user.email}`}>
                                                                <Button variant="outline" size="sm" className="w-full sm:w-auto dark:border-gray-600 dark:text-gray-300">
                                                                    <MailIcon className="h-4 w-4 mr-2" />
                                                                    Send Email
                                                                </Button>
                                                            </a>
                                                        )}
                                                    </CardFooter>
                                                </Card>
                                            ) : report.is_anonymous && (report.reporter_name || report.reporter_contact || report.reporter_address) ? (
                                                <Card className="dark:bg-gray-900">
                                                    <CardHeader>
                                                        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                                                            <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-gray-600 to-slate-600 dark:from-gray-700 dark:to-slate-700 flex items-center justify-center">
                                                                <EyeOff className="h-3 w-3 text-white" />
                                                            </div>
                                                            Anonymous Reporter
                                                        </CardTitle>
                                                        <CardDescription className="dark:text-gray-400">
                                                            Limited contact information provided
                                                        </CardDescription>
                                                    </CardHeader>
                                                    <CardContent className="space-y-4">
                                                        {report.reporter_name && (
                                                            <div>
                                                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Name</p>
                                                                <p className="text-sm dark:text-gray-300">{report.reporter_name}</p>
                                                            </div>
                                                        )}
                                                        {report.reporter_contact && (
                                                            <div>
                                                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Contact</p>
                                                                <p className="text-sm dark:text-gray-300">{report.reporter_contact}</p>
                                                            </div>
                                                        )}
                                                        {report.reporter_address && (
                                                            <div>
                                                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Address</p>
                                                                <p className="text-sm dark:text-gray-300">{report.reporter_address}</p>
                                                            </div>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            ) : (
                                                <Card className="dark:bg-gray-900">
                                                    <CardHeader>
                                                        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                                                            <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-700 dark:to-orange-700 flex items-center justify-center">
                                                                <Shield className="h-3 w-3 text-white" />
                                                            </div>
                                                            Completely Anonymous
                                                        </CardTitle>
                                                        <CardDescription className="dark:text-gray-400">
                                                            No contact information provided
                                                        </CardDescription>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                                                            <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                                            <p className="text-sm text-amber-700 dark:text-amber-400">
                                                                This report was submitted completely anonymously. No personal information is available.
                                                            </p>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            )}
                                        </div>
                                    )}

                                    {/* Evidence Tab Content */}
                                    {activeTab === 'evidence' && (
                                        <Card className="dark:bg-gray-900">
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                                                    <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-700 dark:to-orange-700 flex items-center justify-center">
                                                        <Paperclip className="h-3 w-3 text-white" />
                                                    </div>
                                                    Evidence Files
                                                </CardTitle>
                                                <CardDescription className="dark:text-gray-400">
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
                                                                    <div key={evidence.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-white dark:bg-gray-900/50">
                                                                        <div className="p-4">
                                                                            <div className="flex items-center gap-3">
                                                                                <div className={`p-2 rounded-lg shrink-0 ${
                                                                                    isImage ? 'bg-blue-100 dark:bg-blue-900/30' :
                                                                                    isVideo ? 'bg-purple-100 dark:bg-purple-900/30' :
                                                                                    'bg-gray-100 dark:bg-gray-700'
                                                                                }`}>
                                                                                    {isImage ? (
                                                                                        <FileImage className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                                                    ) : isVideo ? (
                                                                                        <FileVideo className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                                                                    ) : (
                                                                                        <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                                                                    )}
                                                                                </div>
                                                                                <div className="flex-1 min-w-0">
                                                                                    <p className="text-sm font-medium truncate dark:text-gray-200">
                                                                                        {evidence.file_name}
                                                                                    </p>
                                                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                                        {isImage ? 'Image' : isVideo ? 'Video' : 'Document'}
                                                                                    </p>
                                                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                                        {(evidence.file_size / 1024).toFixed(1)} KB
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="bg-gray-50 dark:bg-gray-900/50 px-4 py-2 flex justify-end gap-2 border-t dark:border-gray-700">
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                onClick={() => window.open(fileUrl, '_blank')}
                                                                                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-xs"
                                                                            >
                                                                                <Eye className="h-3 w-3 mr-1" />
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
                                                                                className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 text-xs"
                                                                            >
                                                                                <Download className="h-3 w-3 mr-1" />
                                                                                Download
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-12">
                                                        <Paperclip className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                                            No Evidence Files
                                                        </h3>
                                                        <p className="text-gray-500 dark:text-gray-400">
                                                            No evidence files have been attached to this report.
                                                        </p>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    )}

                                    {/* Activity Tab Content */}
                                    {activeTab === 'activity' && (
                                        <Card className="dark:bg-gray-900">
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                                                    <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-700 dark:to-purple-700 flex items-center justify-center">
                                                        <HistoryIcon className="h-3 w-3 text-white" />
                                                    </div>
                                                    Activity Log
                                                </CardTitle>
                                                <CardDescription className="dark:text-gray-400">
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
                                                                        <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                                                                            safeIncludes(action, 'created') ? 'bg-green-100 dark:bg-green-900/30' :
                                                                            safeIncludes(action, 'updated') ? 'bg-blue-100 dark:bg-blue-900/30' :
                                                                            safeIncludes(action, 'deleted') ? 'bg-red-100 dark:bg-red-900/30' :
                                                                            safeIncludes(action, 'resolved') ? 'bg-green-100 dark:bg-green-900/30' :
                                                                            safeIncludes(action, 'assigned') ? 'bg-purple-100 dark:bg-purple-900/30' :
                                                                            safeIncludes(action, 'viewed') ? 'bg-gray-100 dark:bg-gray-700' :
                                                                            'bg-gray-100 dark:bg-gray-700'
                                                                        }`}>
                                                                            {safeIncludes(action, 'created') ? <Plus className="h-4 w-4" /> :
                                                                             safeIncludes(action, 'updated') ? <Edit className="h-4 w-4" /> :
                                                                             safeIncludes(action, 'deleted') ? <Trash2 className="h-4 w-4" /> :
                                                                             safeIncludes(action, 'resolved') ? <CheckCircle className="h-4 w-4" /> :
                                                                             safeIncludes(action, 'assigned') ? <UserCheck className="h-4 w-4" /> :
                                                                             safeIncludes(action, 'viewed') ? <Eye className="h-4 w-4" /> :
                                                                             <HistoryIcon className="h-4 w-4" />}
                                                                        </div>
                                                                        {index < activity_logs.length - 1 && (
                                                                            <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-700 mt-2"></div>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex-1 pb-4 min-w-0">
                                                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                                                            <p className="font-medium text-sm sm:text-base dark:text-gray-200">{userName}</p>
                                                                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 shrink-0">{getTimeAgo(createdAt)}</p>
                                                                        </div>
                                                                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1 break-words">{details}</p>
                                                                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
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
                                                    <div className="text-center py-12">
                                                        <HistoryIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                                            No Activity Logs
                                                        </h3>
                                                        <p className="text-gray-500 dark:text-gray-400">
                                                            No activity has been recorded for this report yet.
                                                        </p>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                            </div>

                            {/* Right Column - Sidebar */}
                            <div className="space-y-6">
                                {/* Resolution Notes Card */}
                                <Card className="dark:bg-gray-900">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-sm dark:text-gray-100">
                                            <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-700 dark:to-emerald-700 flex items-center justify-center">
                                                <MessageSquare className="h-3 w-3 text-white" />
                                            </div>
                                            Resolution Notes
                                        </CardTitle>
                                        <CardDescription className="dark:text-gray-400">
                                            Internal notes and resolution details
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Textarea
                                            value={adminNotes}
                                            onChange={(e) => setAdminNotes(e.target.value)}
                                            placeholder="Add resolution notes here..."
                                            className="min-h-[150px] text-sm dark:bg-gray-900 dark:border-gray-700"
                                        />
                                    </CardContent>
                                    <CardFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between border-t dark:border-gray-700 pt-4">
                                        <div className="text-xs text-gray-500 dark:text-gray-400 order-2 sm:order-1">
                                            {adminNotes.length} characters
                                        </div>
                                        <Button
                                            onClick={handleSaveNotes}
                                            disabled={isSavingNotes || adminNotes === (report?.resolution_notes || '')}
                                            className="w-full sm:w-auto order-1 sm:order-2 bg-blue-600 hover:bg-blue-700 text-white"
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

                                {/* Staff Assignment Card - UPDATED with username and role fallback */}
                                <Card className="dark:bg-gray-900">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-sm dark:text-gray-100">
                                            <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-700 dark:to-pink-700 flex items-center justify-center">
                                                <UserCheck className="h-3 w-3 text-white" />
                                            </div>
                                            Staff Assignment
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {report.assignedTo ? (
                                            <div>
                                                <div className="flex items-center justify-between mb-3">
                                                    <p className="text-sm font-medium dark:text-gray-300">Currently Assigned</p>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={handleUnassignStaff}
                                                        className="h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/50"
                                                    >
                                                        <X className="h-3 w-3 mr-1" />
                                                        Unassign
                                                    </Button>
                                                </div>
                                                <div className="flex items-center gap-3 p-3 border rounded-lg bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                                                    <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30 shrink-0">
                                                        <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium truncate dark:text-blue-300">
                                                            {getDisplayName(report.assignedTo)}
                                                        </p>
                                                        
                                                        {report.assignedTo.username && (
                                                            <p className="text-xs text-blue-500 dark:text-blue-400 truncate flex items-center gap-1 mt-1">
                                                                <Hash className="h-3 w-3" />
                                                                @{report.assignedTo.username}
                                                            </p>
                                                        )}
                                                        
                                                        {report.assignedTo.email && (
                                                            <p className="text-xs text-gray-600 dark:text-gray-400 truncate flex items-center gap-1 mt-1">
                                                                <Mail className="h-3 w-3" />
                                                                {report.assignedTo.email}
                                                            </p>
                                                        )}
                                                        
                                                        {report.assignedTo.phone || report.assignedTo.contact_number ? (
                                                            <p className="text-xs text-gray-600 dark:text-gray-400 truncate flex items-center gap-1 mt-1">
                                                                <Phone className="h-3 w-3" />
                                                                {report.assignedTo.phone || report.assignedTo.contact_number}
                                                            </p>
                                                        ) : null}
                                                        
                                                        {report.assignedTo.position && (
                                                            <p className="text-xs text-gray-500 dark:text-gray-500 truncate mt-1">
                                                                Position: {report.assignedTo.position}
                                                            </p>
                                                        )}
                                                        
                                                        {report.assignedTo.role && (
                                                            <Badge variant="outline" className="mt-2 text-xs dark:border-gray-600 dark:text-gray-300">
                                                                {report.assignedTo.role}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                <p className="text-sm font-medium mb-3 dark:text-gray-300">Not Assigned</p>
                                                <div className="p-4 border border-dashed dark:border-gray-700 rounded-lg text-center">
                                                    <User className="h-8 w-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">No staff assigned to this report</p>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={handleAssignToStaff}
                                                        className="w-full dark:border-gray-600 dark:text-gray-300"
                                                    >
                                                        <UserCheck className="h-4 w-4 mr-2" />
                                                        Assign Staff
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Quick Assign Suggestions - UPDATED with username and role fallback */}
                                        {staff.length > 0 && !report.assignedTo && (
                                            <div className="pt-4 border-t dark:border-gray-700">
                                                <p className="text-sm font-medium mb-2 dark:text-gray-300">Quick Assign</p>
                                                <div className="space-y-2">
                                                    {staff.slice(0, 3).map((staffMember) => (
                                                        <Button
                                                            key={staffMember.id}
                                                            variant="outline"
                                                            className="w-full justify-start text-sm dark:border-gray-600 dark:text-gray-300"
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
                                                            <User className="h-4 w-4 mr-2 shrink-0" />
                                                            <div className="flex-1 text-left truncate">
                                                                <span className="font-medium truncate dark:text-gray-200">
                                                                    {getDisplayName(staffMember)}
                                                                </span>
                                                                {staffMember.position && (
                                                                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 truncate hidden sm:inline">
                                                                        • {staffMember.position}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {staffMember.role && (
                                                                <Badge variant="secondary" className="ml-auto text-xs shrink-0 dark:bg-gray-700 dark:text-gray-300">
                                                                    {staffMember.role}
                                                                </Badge>
                                                            )}
                                                        </Button>
                                                    ))}
                                                    {staff.length > 3 && (
                                                        <Button
                                                            variant="ghost"
                                                            className="w-full text-sm dark:text-gray-400 dark:hover:text-gray-300"
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

                                {/* Quick Actions Card */}
                                <Card className="dark:bg-gray-900">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-sm dark:text-gray-100">
                                            <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-amber-600 to-yellow-600 dark:from-amber-700 dark:to-yellow-700 flex items-center justify-center">
                                                <Zap className="h-3 w-3 text-white" />
                                            </div>
                                            Quick Actions
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start text-sm dark:border-gray-600 dark:text-gray-300"
                                            onClick={handleSendResponse}
                                            size="sm"
                                        >
                                            <Send className="h-4 w-4 mr-2" />
                                            Send Response
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start text-sm dark:border-gray-600 dark:text-gray-300"
                                            onClick={() => router.visit(route('admin.community-reports.related', report.id))}
                                            size="sm"
                                        >
                                            <Layers className="h-4 w-4 mr-2" />
                                            View Related Reports
                                        </Button>
                                        {report.has_previous_report && report.previous_report && (
                                            <Link href={route('admin.community-reports.show', report.previous_report.id)}>
                                                <Button
                                                    variant="outline"
                                                    className="w-full justify-start text-sm dark:border-gray-600 dark:text-gray-300"
                                                    size="sm"
                                                >
                                                    <HistoryIcon className="h-4 w-4 mr-2" />
                                                    View Previous Report
                                                </Button>
                                            </Link>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Timeline Card */}
                                <Card className="dark:bg-gray-900">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-sm dark:text-gray-100">
                                            <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 flex items-center justify-center">
                                                <Clock className="h-3 w-3 text-white" />
                                            </div>
                                            Timeline
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Report Created</p>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                                                <p className="text-xs sm:text-sm dark:text-gray-300">{formatDateTime(report.created_at)}</p>
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                {getTimeAgo(report.created_at)}
                                            </p>
                                        </div>

                                        <Separator className="dark:bg-gray-700" />

                                        <div>
                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Last Updated</p>
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                                                <p className="text-xs sm:text-sm dark:text-gray-300">{formatDateTime(report.updated_at)}</p>
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                {getTimeAgo(report.updated_at)}
                                            </p>
                                        </div>

                                        <Separator className="dark:bg-gray-700" />

                                        {report.acknowledged_at && (
                                            <div>
                                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Acknowledged</p>
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle className="h-3 w-3 text-green-400 dark:text-green-500" />
                                                    <p className="text-xs sm:text-sm dark:text-gray-300">{formatDateTime(report.acknowledged_at)}</p>
                                                </div>
                                            </div>
                                        )}

                                        {report.resolved_at && (
                                            <div>
                                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Resolved</p>
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle className="h-3 w-3 text-green-400 dark:text-green-500" />
                                                    <p className="text-xs sm:text-sm dark:text-gray-300">{formatDateTime(report.resolved_at)}</p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="pt-2">
                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Response Time</p>
                                            <p className="text-sm font-semibold dark:text-gray-200">{calculateResponseTime()}</p>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* System Information Card */}
                                <Card className="dark:bg-gray-900">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-sm dark:text-gray-100">
                                            <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-gray-600 to-slate-600 dark:from-gray-700 dark:to-slate-700 flex items-center justify-center">
                                                <Hash className="h-3 w-3 text-white" />
                                            </div>
                                            System Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Report ID</p>
                                            <p className="text-xs font-mono mt-1 dark:text-gray-300">{report.report_number || 'N/A'}</p>
                                        </div>
                                        <Separator className="dark:bg-gray-700" />
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Database ID</p>
                                            <p className="text-xs font-mono mt-1 dark:text-gray-300">#{report.id}</p>
                                        </div>
                                        <Separator className="dark:bg-gray-700" />
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Report Type ID</p>
                                            <p className="text-xs font-mono mt-1 dark:text-gray-300">#{report.report_type?.id || 'N/A'}</p>
                                        </div>
                                        {report.has_previous_report && report.previous_report_id && (
                                            <>
                                                <Separator className="dark:bg-gray-700" />
                                                <div>
                                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Previous Report</p>
                                                    <p className="text-xs font-mono mt-1 dark:text-gray-300">#{report.previous_report_id}</p>
                                                </div>
                                            </>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Similar Reports Card */}
                                {similar_reports && similar_reports.length > 0 && (
                                    <Card className="dark:bg-gray-900">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 text-sm dark:text-gray-100">
                                                <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-700 dark:to-purple-700 flex items-center justify-center">
                                                    <Layers className="h-3 w-3 text-white" />
                                                </div>
                                                Similar Reports
                                            </CardTitle>
                                            <CardDescription className="dark:text-gray-400">
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
                                                    <div className="p-3 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <Badge className={`${getStatusColor(similar.status)} text-xs`}>
                                                                    {similar.status?.charAt(0).toUpperCase()}
                                                                </Badge>
                                                                <span className="text-xs font-medium truncate dark:text-gray-300">#{similar.report_number}</span>
                                                            </div>
                                                            <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500 shrink-0" />
                                                        </div>
                                                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">{similar.title}</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{formatDate(similar.created_at)}</p>
                                                    </div>
                                                </Link>
                                            ))}
                                            {similar_reports.length > 3 && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="w-full text-xs sm:text-sm dark:text-gray-400 dark:hover:text-gray-300"
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
                    <AlertDialogContent className="dark:bg-gray-900">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="dark:text-gray-100">Delete Community Report</AlertDialogTitle>
                            <AlertDialogDescription className="dark:text-gray-400">
                                Are you sure you want to delete community report #{report.report_number}?
                                This action cannot be undone. All associated data including evidence files and activity logs will be permanently removed.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={isDeleting} className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDelete}
                                className="bg-red-600 hover:bg-red-700 text-white"
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

                {/* Assign to Staff Dialog - UPDATED with username and role fallback */}
                <AlertDialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
                    <AlertDialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col dark:bg-gray-900">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="dark:text-gray-100">Assign to Staff</AlertDialogTitle>
                            <AlertDialogDescription className="dark:text-gray-400">
                                Select a barangay official to assign this report to. Only active non-resident users are listed.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        
                        <div className="flex-1 overflow-y-auto py-4">
                            {/* Search Bar */}
                            <div className="mb-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                    <input
                                        type="text"
                                        placeholder="Search staff by name, email, phone, position, or role..."
                                        value={staffSearch}
                                        onChange={(e) => setStaffSearch(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm dark:bg-gray-900 dark:text-gray-300"
                                    />
                                </div>
                            </div>

                            {/* Staff List - UPDATED with username display */}
                            <div className="space-y-2">
                                {filteredStaff.length === 0 ? (
                                    <div className="text-center py-8">
                                        <User className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                            {staffSearch ? 'No Matching Staff Found' : 'No Staff Available'}
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400">
                                            {staffSearch 
                                                ? 'Try a different search term' 
                                                : 'No active barangay officials with assigned roles are currently available.'}
                                        </p>
                                    </div>
                                ) : (
                                    filteredStaff.map((staffMember) => (
                                        <div
                                            key={staffMember.id}
                                            className={`p-4 border dark:border-gray-700 rounded-lg cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                                                selectedStaff === staffMember.id 
                                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700' 
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
                                                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                                            <span className="font-semibold text-blue-600 dark:text-blue-400">
                                                                {staffMember.initials}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                                            <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-medium truncate dark:text-gray-200">
                                                            {getDisplayName(staffMember)}
                                                        </p>
                                                        {staffMember.username && (
                                                            <Badge variant="outline" className="text-xs bg-gray-100 dark:bg-gray-700 dark:text-blue-400 dark:border-blue-800">
                                                                @{staffMember.username}
                                                            </Badge>
                                                        )}
                                                        {selectedStaff === staffMember.id && (
                                                            <Check className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
                                                        )}
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-gray-600 dark:text-gray-400">
                                                        {staffMember.position && (
                                                            <Badge variant="outline" className="text-xs bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600">
                                                                {staffMember.position}
                                                            </Badge>
                                                        )}
                                                        {staffMember.role && (
                                                            <Badge variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-300">
                                                                {staffMember.role}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
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
                                <Label htmlFor="assign-notes" className="text-sm font-medium mb-2 block dark:text-gray-300">
                                    Assignment Notes (Optional)
                                </Label>
                                <Textarea
                                    id="assign-notes"
                                    placeholder="Add notes about this assignment..."
                                    value={assignNotes}
                                    onChange={(e) => setAssignNotes(e.target.value)}
                                    className="min-h-[100px] text-sm dark:bg-gray-900 dark:border-gray-700"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    These notes will be added to the resolution notes.
                                </p>
                            </div>

                            {/* Selected Staff Preview - UPDATED with username */}
                            {selectedStaffMember && (
                                <div className="mt-4 p-4 border border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-sm font-medium text-blue-700 dark:text-blue-400">Selected Staff</p>
                                        <Badge variant="outline" className="bg-white dark:bg-gray-900 dark:border-gray-600 dark:text-gray-300">
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
                                            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                                <span className="font-semibold text-blue-600 dark:text-blue-400 text-xs">
                                                    {selectedStaffMember.initials}
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                                <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate dark:text-blue-300">
                                                {getDisplayName(selectedStaffMember)}
                                            </p>
                                            {selectedStaffMember.username && (
                                                <p className="text-xs text-blue-500 dark:text-blue-400 truncate">
                                                    @{selectedStaffMember.username}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-2 mt-0.5">
                                                {selectedStaffMember.position && (
                                                    <span className="text-xs text-gray-600 dark:text-gray-400">{selectedStaffMember.position}</span>
                                                )}
                                                {selectedStaffMember.role && (
                                                    <span className="text-xs text-gray-500 dark:text-gray-500">{selectedStaffMember.role}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <AlertDialogFooter className="pt-4 border-t dark:border-gray-700">
                            <AlertDialogCancel disabled={isAssigning} className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleAssignSubmit}
                                disabled={isAssigning || !selectedStaff}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
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
        </>
    );
}