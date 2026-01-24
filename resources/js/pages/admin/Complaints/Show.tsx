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
    Timeline,
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
    ToggleLeft as ToggleLeftIcon,
    ToggleRight as ToggleRightIcon,
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
    CloudSleet,
    Tornado,
    Hurricane,
    Earthquake,
    Flood,
    Fire,
    Volcano,
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
    CloudX,
    CloudWarning,
    CloudQuestion,
    CloudLightning as CloudLightningIcon,
    CloudRain as CloudRainIcon,
    CloudSnow as CloudSnowIcon,
    CloudDrizzle as CloudDrizzleIcon,
    CloudHail as CloudHailIcon,
    CloudSleet as CloudSleetIcon,
    Tornado as TornadoIcon,
    Hurricane as HurricaneIcon,
    Earthquake as EarthquakeIcon,
    Flood as FloodIcon,
    Fire as FireIcon,
    Volcano as VolcanoIcon,
    Snowflake as SnowflakeIcon,
    Haze as HazeIcon,
    Sunrise as SunriseIcon,
    Sunset as SunsetIcon
} from 'lucide-react';

type Complaint = {
    id: number;
    complaint_number: string;
    user_id: number;
    user?: {
        id: number;
        name: string;
        email?: string;
        phone?: string;
        address?: string;
        purok?: string;
        barangay?: string;
        city?: string;
        province?: string;
        zip_code?: string;
    };
    type: string;
    subject: string;
    description: string;
    location: string;
    incident_date: string;
    priority: 'low' | 'medium' | 'high';
    status: 'pending' | 'under_review' | 'resolved' | 'dismissed';
    is_anonymous: boolean;
    evidence_files?: string[];
    admin_notes?: string;
    resolved_at?: string;
    created_at: string;
    updated_at: string;
    assigned_to?: {
        id: number;
        name: string;
        email?: string;
        role?: string;
    };
    tags?: string[];
    category?: string;
    severity_level?: 'minor' | 'moderate' | 'severe' | 'critical';
    response_time?: string;
    resolution_time?: string;
    follow_up_date?: string;
    escalation_level?: number;
    related_complaints?: number[];
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
}

declare module '@inertiajs/react' {
    interface PageProps {
        complaint: Complaint;
        activity_logs?: ActivityLog[];
        flash?: {
            success?: string;
            error?: string;
        };
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
        return format(new Date(dateString), 'MMM dd, yyyy HH:mm:ss');
    } catch (error) {
        return 'Invalid Date';
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
        case 'under_review':
            return <Clock className="h-5 w-5 text-blue-500" />;
        case 'pending':
            return <AlertCircle className="h-5 w-5 text-amber-500" />;
        case 'dismissed':
            return <Archive className="h-5 w-5 text-gray-500" />;
        default:
            return <AlertCircle className="h-5 w-5" />;
    }
};

const getPriorityIcon = (priority: string | null | undefined) => {
    switch (priority) {
        case 'high':
            return <AlertTriangle className="h-5 w-5 text-red-500" />;
        case 'medium':
            return <AlertCircle className="h-5 w-5 text-amber-500" />;
        case 'low':
            return <Clock className="h-5 w-5 text-green-500" />;
        default:
            return <Clock className="h-5 w-5" />;
    }
};

const getSeverityIcon = (severity?: string | null) => {
    if (!severity) return <AlertCircle className="h-4 w-4" />;
    switch (severity.toLowerCase()) {
        case 'critical':
            return <AlertTriangle className="h-4 w-4 text-red-500" />;
        case 'severe':
            return <AlertOctagon className="h-4 w-4 text-orange-500" />;
        case 'moderate':
            return <AlertCircle className="h-4 w-4 text-yellow-500" />;
        case 'minor':
            return <Info className="h-4 w-4 text-blue-500" />;
        default:
            return <AlertCircle className="h-4 w-4" />;
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
    return str.includes(searchString);
};

export default function ComplaintShow({
    complaint,
    activity_logs = [],
    flash
}: {
    complaint: Complaint | null;
    activity_logs?: ActivityLog[];
    flash?: {
        success?: string;
        error?: string;
    };
}) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [adminNotes, setAdminNotes] = useState(complaint?.admin_notes || '');
    const [isSavingNotes, setIsSavingNotes] = useState(false);
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState('details');

    // Handle null complaint
    if (!complaint) {
        return (
            <AppLayout
                title="Complaint Not Found"
                breadcrumbs={[
                    { title: 'Dashboard', href: '/admin/dashboard' },
                    { title: 'Complaints', href: '/admin/complaints' },
                    { title: 'Not Found', href: '#' }
                ]}
            >
                <div className="text-center py-12">
                    <AlertCircle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Complaint Not Found</h1>
                    <p className="text-gray-600 mb-6">The complaint you are looking for does not exist or has been removed.</p>
                    <Link href={route('admin.complaints.index')}>
                        <Button>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Complaints
                        </Button>
                    </Link>
                </div>
            </AppLayout>
        );
    }

    // Handle delete
    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(route('admin.complaints.destroy', complaint.id), {
            preserveScroll: true,
            onFinish: () => setIsDeleting(false),
        });
    };

    // Handle save admin notes
    const handleSaveNotes = () => {
        setIsSavingNotes(true);
        router.put(route('admin.complaints.update', complaint.id), {
            admin_notes: adminNotes,
        }, {
            preserveScroll: true,
            onFinish: () => setIsSavingNotes(false),
        });
    };

    // Handle copy complaint number
    const handleCopyComplaintNumber = () => {
        if (complaint.complaint_number) {
            navigator.clipboard.writeText(complaint.complaint_number).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            });
        }
    };

    // Handle print
    const handlePrint = () => {
        window.open(`/admin/complaints/${complaint.id}/print`, '_blank');
    };

    // Handle status change
    const handleStatusChange = (newStatus: string) => {
        if (confirm(`Change complaint status to ${newStatus}?`)) {
            router.put(route('admin.complaints.update', complaint.id), {
                status: newStatus,
            }, {
                preserveScroll: true,
            });
        }
    };

    // Handle priority change
    const handlePriorityChange = (newPriority: string) => {
        if (confirm(`Change complaint priority to ${newPriority}?`)) {
            router.put(route('admin.complaints.update', complaint.id), {
                priority: newPriority,
            }, {
                preserveScroll: true,
            });
        }
    };

    // Handle assign to staff
    const handleAssignToStaff = () => {
        alert('Assign to staff functionality would open a modal here');
    };

    // Handle send response
    const handleSendResponse = () => {
        window.open(`/admin/complaints/${complaint.id}/response`, '_blank');
    };

    // Calculate response time
    const calculateResponseTime = () => {
        if (!complaint.created_at) return 'N/A';
        const created = new Date(complaint.created_at);
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

    return (
        <AppLayout
            title={`Complaint #${complaint.complaint_number || 'N/A'}`}
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Complaints', href: '/admin/complaints' },
                { title: `#${complaint.complaint_number || 'N/A'}`, href: route('admin.complaints.show', complaint.id) }
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
                            <Link href={route('admin.complaints.index')}>
                                <Button variant="outline" size="sm">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to List
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
                                    Complaint #{complaint.complaint_number || 'N/A'}
                                </h1>
                                <p className="text-gray-600 mt-1">
                                    {complaint.subject || 'No subject'}
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handlePrint}
                                    >
                                        <Printer className="h-4 w-4 mr-2" />
                                        Print
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    Print complaint details
                                </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleCopyComplaintNumber}
                                        disabled={!complaint.complaint_number}
                                    >
                                        {copied ? (
                                            <Check className="h-4 w-4 mr-2 text-green-600" />
                                        ) : (
                                            <Copy className="h-4 w-4 mr-2" />
                                        )}
                                        {copied ? 'Copied!' : 'Copy ID'}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    Copy complaint number
                                </TooltipContent>
                            </Tooltip>

                       

                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setShowDeleteDialog(true)}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </Button>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Complaint Details */}
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
                                    <CardContent>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                {getStatusIcon(complaint.status)}
                                                <div>
                                                    <p className="text-xl font-semibold capitalize">
                                                        {formatStatusText(complaint.status)}
                                                    </p>
                                                    {complaint.resolved_at && (
                                                        <p className="text-sm text-gray-500">
                                                            Resolved: {formatDate(complaint.resolved_at)}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-1">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleStatusChange('pending')}
                                                            className={`h-8 ${complaint.status === 'pending' ? 'bg-amber-50 text-amber-700' : ''}`}
                                                        >
                                                            Pending
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        Mark as Pending
                                                    </TooltipContent>
                                                </Tooltip>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleStatusChange('resolved')}
                                                            className={`h-8 ${complaint.status === 'resolved' ? 'bg-green-50 text-green-700' : ''}`}
                                                        >
                                                            Resolve
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        Mark as Resolved
                                                    </TooltipContent>
                                                </Tooltip>
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
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                {getPriorityIcon(complaint.priority)}
                                                <div>
                                                    <p className="text-xl font-semibold capitalize">
                                                        {complaint.priority || 'Not set'}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {complaint.priority === 'high' ? 'Urgent attention needed' :
                                                         complaint.priority === 'medium' ? 'Moderate attention needed' :
                                                         complaint.priority === 'low' ? 'Standard attention' : 'Priority not set'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-1">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handlePriorityChange('low')}
                                                            className={`h-8 ${complaint.priority === 'low' ? 'bg-green-50 text-green-700' : ''}`}
                                                        >
                                                            Low
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        Set to Low Priority
                                                    </TooltipContent>
                                                </Tooltip>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handlePriorityChange('high')}
                                                            className={`h-8 ${complaint.priority === 'high' ? 'bg-red-50 text-red-700' : ''}`}
                                                        >
                                                            High
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        Set to High Priority
                                                    </TooltipContent>
                                                </Tooltip>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Tabs for Details, Evidence, Activity */}
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                                <TabsList className="grid grid-cols-3">
                                    <TabsTrigger value="details">
                                        <FileText className="h-4 w-4 mr-2" />
                                        Details
                                    </TabsTrigger>
                                    <TabsTrigger value="evidence">
                                        <Paperclip className="h-4 w-4 mr-2" />
                                        Evidence
                                    </TabsTrigger>
                                    <TabsTrigger value="activity">
                                        <History className="h-4 w-4 mr-2" />
                                        Activity
                                    </TabsTrigger>
                                </TabsList>

                                {/* Details Tab */}
                                <TabsContent value="details" className="space-y-6">
                                    {/* Complaint Information */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Complaint Information</CardTitle>
                                            <CardDescription>
                                                Detailed information about the complaint
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label className="text-sm font-medium text-gray-500">Complaint Type</Label>
                                                    <p className="mt-1 text-sm">{complaint.type || 'Not specified'}</p>
                                                </div>
                                                <div>
                                                    <Label className="text-sm font-medium text-gray-500">Category</Label>
                                                    <p className="mt-1 text-sm">{complaint.category || 'Uncategorized'}</p>
                                                </div>
                                                <div className="md:col-span-2">
                                                    <Label className="text-sm font-medium text-gray-500">Subject</Label>
                                                    <p className="mt-1 text-sm font-medium">{complaint.subject || 'No subject'}</p>
                                                </div>
                                                <div className="md:col-span-2">
                                                    <Label className="text-sm font-medium text-gray-500">Description</Label>
                                                    <div className="mt-1 p-3 bg-gray-50 rounded-md">
                                                        <p className="text-sm whitespace-pre-line">{complaint.description || 'No description provided'}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <Separator />

                                            {/* Location and Date Information */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                                                        <MapPin className="h-4 w-4" />
                                                        Location
                                                    </Label>
                                                    <p className="mt-1 text-sm">{complaint.location || 'Not specified'}</p>
                                                </div>
                                                <div>
                                                    <Label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                                                        <Calendar className="h-4 w-4" />
                                                        Incident Date
                                                    </Label>
                                                    <p className="mt-1 text-sm">{formatDate(complaint.incident_date)}</p>
                                                </div>
                                            </div>

                                            {/* Additional Information */}
                                            {complaint.severity_level && (
                                                <div>
                                                    <Label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                                                        {getSeverityIcon(complaint.severity_level)}
                                                        Severity Level
                                                    </Label>
                                                    <Badge variant="outline" className="mt-1 capitalize">
                                                        {complaint.severity_level}
                                                    </Badge>
                                                </div>
                                            )}

                                            {complaint.tags && complaint.tags.length > 0 && (
                                                <div>
                                                    <Label className="text-sm font-medium text-gray-500">Tags</Label>
                                                    <div className="flex flex-wrap gap-2 mt-1">
                                                        {complaint.tags.map((tag, index) => (
                                                            <Badge key={index} variant="secondary">
                                                                {tag}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>

                                    {/* Resident Information */}
                                    {!complaint.is_anonymous && complaint.user && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Resident Information</CardTitle>
                                                <CardDescription>
                                                    Details of the resident who filed the complaint
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-full bg-gray-100">
                                                        <User className="h-6 w-6 text-gray-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{complaint.user.name || 'Unknown'}</p>
                                                        <p className="text-sm text-gray-500">
                                                            {complaint.user.purok ? `Purok ${complaint.user.purok}` : 'No purok specified'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {complaint.user.phone && (
                                                        <div>
                                                            <Label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                                                                <Phone className="h-4 w-4" />
                                                                Phone
                                                            </Label>
                                                            <p className="mt-1 text-sm">{complaint.user.phone}</p>
                                                        </div>
                                                    )}
                                                    {complaint.user.email && (
                                                        <div>
                                                            <Label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                                                                <Mail className="h-4 w-4" />
                                                                Email
                                                            </Label>
                                                            <p className="mt-1 text-sm">{complaint.user.email}</p>
                                                        </div>
                                                    )}
                                                    {complaint.user.address && (
                                                        <div className="md:col-span-2">
                                                            <Label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                                                                <Home className="h-4 w-4" />
                                                                Address
                                                            </Label>
                                                            <p className="mt-1 text-sm">{complaint.user.address}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                            <CardFooter className="flex justify-end space-x-2">
                                                <Button variant="outline" size="sm" disabled={!complaint.user.phone}>
                                                    <PhoneCall className="h-4 w-4 mr-2" />
                                                    Call Resident
                                                </Button>
                                                <Button variant="outline" size="sm" disabled={!complaint.user.phone}>
                                                    <MessageCircle className="h-4 w-4 mr-2" />
                                                    Send SMS
                                                </Button>
                                                <Button variant="outline" size="sm" disabled={!complaint.user.email}>
                                                    <MailIcon className="h-4 w-4 mr-2" />
                                                    Send Email
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    )}

                                    {/* Anonymous Notice */}
                                    {complaint.is_anonymous && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <EyeOff className="h-5 w-5" />
                                                    Anonymous Complaint
                                                </CardTitle>
                                                <CardDescription>
                                                    This complaint was submitted anonymously
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex items-center gap-3 text-amber-600">
                                                    <Shield className="h-5 w-5" />
                                                    <p className="text-sm">
                                                        The resident's identity is protected. No personal information is available.
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
                                            <CardTitle>Evidence Files</CardTitle>
                                            <CardDescription>
                                                Attached evidence and documentation
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            {complaint.evidence_files && complaint.evidence_files.length > 0 ? (
                                                <div className="space-y-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                        {complaint.evidence_files.map((file, index) => {
                                                            const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(file);
                                                            const fileName = file.split('/').pop() || `evidence-${index + 1}`;
                                                            
                                                            return (
                                                                <div key={index} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                                                                    <div className="p-4">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="p-2 rounded-lg bg-gray-100">
                                                                                {isImage ? (
                                                                                    <FileImage className="h-6 w-6 text-blue-600" />
                                                                                ) : (
                                                                                    <FileText className="h-6 w-6 text-gray-600" />
                                                                                )}
                                                                            </div>
                                                                            <div className="flex-1 min-w-0">
                                                                                <p className="text-sm font-medium truncate">
                                                                                    {fileName}
                                                                                </p>
                                                                                <p className="text-xs text-gray-500">
                                                                                    {isImage ? 'Image file' : 'Document'}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="bg-gray-50 px-4 py-2 flex justify-end gap-2">
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() => window.open(file, '_blank')}
                                                                            className="text-blue-600 hover:text-blue-700"
                                                                        >
                                                                            <Eye className="h-4 w-4 mr-1" />
                                                                            View
                                                                        </Button>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() => {
                                                                                const a = document.createElement('a');
                                                                                a.href = file;
                                                                                a.download = fileName;
                                                                                a.click();
                                                                            }}
                                                                            className="text-green-600 hover:text-green-700"
                                                                        >
                                                                            <Download className="h-4 w-4 mr-1" />
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
                                                        No evidence files have been attached to this complaint.
                                                    </p>
                                                </div>
                                            )}
                                        </CardContent>
                                        <CardFooter>
                                            <Button variant="outline">
                                                <Paperclip className="h-4 w-4 mr-2" />
                                                Upload Additional Evidence
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                </TabsContent>

                                {/* Activity Tab */}
                                <TabsContent value="activity" className="space-y-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Activity Log</CardTitle>
                                            <CardDescription>
                                                Timeline of all actions taken on this complaint
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            {activity_logs && activity_logs.length > 0 ? (
                                                <div className="space-y-4">
                                                    {activity_logs.map((log, index) => {
                                                        // Safely extract values with defaults
                                                        const logId = log?.id || index;
                                                        const action = log?.action || '';
                                                        const userName = log?.user_name || 'Unknown User';
                                                        const details = log?.details || 'No details provided';
                                                        const createdAt = log?.created_at || '';
                                                        const ipAddress = log?.ip_address;

                                                        return (
                                                            <div key={logId} className="flex gap-4">
                                                                <div className="flex flex-col items-center">
                                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                                                        safeIncludes(action, 'created') ? 'bg-green-100 text-green-600' :
                                                                        safeIncludes(action, 'updated') ? 'bg-blue-100 text-blue-600' :
                                                                        safeIncludes(action, 'deleted') ? 'bg-red-100 text-red-600' :
                                                                        'bg-gray-100 text-gray-600'
                                                                    }`}>
                                                                        {safeIncludes(action, 'created') ? <Plus className="h-4 w-4" /> :
                                                                         safeIncludes(action, 'updated') ? <Edit className="h-4 w-4" /> :
                                                                         safeIncludes(action, 'deleted') ? <Trash2 className="h-4 w-4" /> :
                                                                         <History className="h-4 w-4" />}
                                                                    </div>
                                                                    {index < activity_logs.length - 1 && (
                                                                        <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
                                                                    )}
                                                                </div>
                                                                <div className="flex-1 pb-4">
                                                                    <div className="flex items-center justify-between">
                                                                        <p className="font-medium">{userName}</p>
                                                                        <p className="text-sm text-gray-500">{getTimeAgo(createdAt)}</p>
                                                                    </div>
                                                                    <p className="text-sm text-gray-600 mt-1">{details}</p>
                                                                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
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
                                                        No activity has been recorded for this complaint yet.
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
                            {/* Admin Notes */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Admin Notes</CardTitle>
                                    <CardDescription>
                                        Internal notes and observations
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Textarea
                                        value={adminNotes}
                                        onChange={(e) => setAdminNotes(e.target.value)}
                                        placeholder="Add internal notes here..."
                                        className="min-h-[200px]"
                                    />
                                </CardContent>
                                <CardFooter className="flex justify-between">
                                    <div className="text-sm text-gray-500">
                                        {adminNotes.length} characters
                                    </div>
                                    <Button
                                        onClick={handleSaveNotes}
                                        disabled={isSavingNotes || adminNotes === (complaint?.admin_notes || '')}
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

                            {/* Quick Actions */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Quick Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start"
                                        onClick={handleAssignToStaff}
                                    >
                                        <UserCheck className="h-4 w-4 mr-2" />
                                        Assign to Staff
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start"
                                        onClick={handleSendResponse}
                                    >
                                        <Send className="h-4 w-4 mr-2" />
                                        Send Response
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start"
                                        onClick={() => router.visit(`/admin/complaints/${complaint.id}/follow-up`)}
                                    >
                                        <MessageSquare className="h-4 w-4 mr-2" />
                                        Schedule Follow-up
                                    </Button>
                                    {complaint.related_complaints && complaint.related_complaints.length > 0 && (
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start"
                                            onClick={() => router.visit(`/admin/complaints?related=${complaint.id}`)}
                                        >
                                            <Layers className="h-4 w-4 mr-2" />
                                            View Related ({complaint.related_complaints.length})
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Timeline Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Timeline</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label className="text-sm font-medium text-gray-500">Created</Label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Calendar className="h-4 w-4 text-gray-400" />
                                            <p className="text-sm">{formatDateTime(complaint.created_at)}</p>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {getTimeAgo(complaint.created_at)}
                                        </p>
                                    </div>

                                    <div>
                                        <Label className="text-sm font-medium text-gray-500">Last Updated</Label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Clock className="h-4 w-4 text-gray-400" />
                                            <p className="text-sm">{formatDateTime(complaint.updated_at)}</p>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {getTimeAgo(complaint.updated_at)}
                                        </p>
                                    </div>

                                    {complaint.resolved_at && (
                                        <div>
                                            <Label className="text-sm font-medium text-gray-500">Resolved</Label>
                                            <div className="flex items-center gap-2 mt-1">
                                                <CheckCircle className="h-4 w-4 text-green-400" />
                                                <p className="text-sm">{formatDateTime(complaint.resolved_at)}</p>
                                            </div>
                                        </div>
                                    )}

                                    {complaint.follow_up_date && (
                                        <div>
                                            <Label className="text-sm font-medium text-gray-500">Next Follow-up</Label>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Calendar className="h-4 w-4 text-blue-400" />
                                                <p className="text-sm">{formatDate(complaint.follow_up_date)}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <Label className="text-sm font-medium text-gray-500">Response Time</Label>
                                        <p className="mt-1 text-sm">{calculateResponseTime()}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Assigned Staff */}
                            {complaint.assigned_to && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Assigned Staff</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-full bg-blue-100">
                                                <User className="h-6 w-6 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{complaint.assigned_to.name}</p>
                                                {complaint.assigned_to.role && (
                                                    <p className="text-sm text-gray-500">{complaint.assigned_to.role}</p>
                                                )}
                                                {complaint.assigned_to.email && (
                                                    <p className="text-sm text-gray-500">{complaint.assigned_to.email}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="mt-4 flex gap-2">
                                            <Button variant="outline" size="sm" className="flex-1">
                                                <MessageCircle className="h-4 w-4 mr-2" />
                                                Message
                                            </Button>
                                            <Button variant="outline" size="sm" className="flex-1">
                                                <PhoneCall className="h-4 w-4 mr-2" />
                                                Call
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* System Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>System Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div>
                                        <Label className="text-sm font-medium text-gray-500">Complaint ID</Label>
                                        <p className="text-sm font-mono mt-1">{complaint.complaint_number || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-500">Database ID</Label>
                                        <p className="text-sm font-mono mt-1">#{complaint.id}</p>
                                    </div>
                                    {complaint.escalation_level && (
                                        <div>
                                            <Label className="text-sm font-medium text-gray-500">Escalation Level</Label>
                                            <p className="text-sm mt-1">Level {complaint.escalation_level}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </TooltipProvider>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Complaint</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete complaint #{complaint.complaint_number}?
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
                                'Delete Complaint'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}