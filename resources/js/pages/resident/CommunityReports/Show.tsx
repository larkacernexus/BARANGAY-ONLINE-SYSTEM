import ResidentLayout from '@/layouts/resident-app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import {
    ArrowLeft,
    AlertCircle,
    MapPin,
    Calendar,
    Clock,
    Shield,
    FileText,
    Download,
    Eye,
    User,
    MessageSquare,
    CheckCircle,
    XCircle,
    AlertTriangle,
    History,
    Printer,
    Share2,
    ExternalLink,
    Phone,
    Mail,
    ChevronRight,
    ChevronDown,
    ChevronUp,
    Info,
    File,
    CalendarDays,
    MessageCircle,
    HelpCircle,
    MoreVertical,
    Home,
    Navigation,
    Paperclip,
    Image,
    FileVideo,
    Trash2,
    Zap,
    Users,
    Volume2,
    Bell,
    Construction,
    Car,
    PawPrint,
    HeartPulse,
    Store,
    Building,
    List,
    Layers,
    FileCheck,
    DollarSign
} from 'lucide-react';
import { Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';

// Modern Status Configuration - Matching Clearance design
const STATUS_CONFIG = {
    pending: { 
        label: 'Pending', 
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', 
        icon: Clock,
        gradient: 'from-yellow-50 to-yellow-100/50 dark:from-yellow-900/20 dark:to-yellow-800/20',
        description: 'Waiting for review',
        nextStep: 'Will be assigned for review'
    },
    under_review: { 
        label: 'Under Review', 
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', 
        icon: History,
        gradient: 'from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/20',
        description: 'Being investigated',
        nextStep: 'Awaiting resolution'
    },
    assigned: { 
        label: 'Assigned', 
        color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400', 
        icon: Users,
        gradient: 'from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/20',
        description: 'Assigned to personnel',
        nextStep: 'Work in progress'
    },
    in_progress: { 
        label: 'In Progress', 
        color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400', 
        icon: Zap,
        gradient: 'from-indigo-50 to-indigo-100/50 dark:from-indigo-900/20 dark:to-indigo-800/20',
        description: 'Work in progress',
        nextStep: 'Awaiting completion'
    },
    resolved: { 
        label: 'Resolved', 
        color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', 
        icon: CheckCircle,
        gradient: 'from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/20',
        description: 'Successfully resolved',
        nextStep: 'Case closed'
    },
    rejected: { 
        label: 'Rejected', 
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400', 
        icon: XCircle,
        gradient: 'from-gray-50 to-gray-100/50 dark:from-gray-800 dark:to-gray-700',
        description: 'Report rejected',
        nextStep: 'No further action'
    },
};

// Modern Priority Configuration
const PRIORITY_CONFIG = {
    critical: { 
        label: 'Critical', 
        color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', 
        icon: AlertCircle,
        dot: 'bg-red-500',
        gradient: 'from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/20'
    },
    high: { 
        label: 'High', 
        color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400', 
        icon: AlertTriangle,
        dot: 'bg-orange-500',
        gradient: 'from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/20'
    },
    medium: { 
        label: 'Medium', 
        color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400', 
        icon: AlertTriangle,
        dot: 'bg-amber-500',
        gradient: 'from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-800/20'
    },
    low: { 
        label: 'Low', 
        color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', 
        icon: CheckCircle,
        dot: 'bg-green-500',
        gradient: 'from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/20'
    },
};

// Modern Urgency Configuration
const URGENCY_CONFIG = {
    high: { 
        label: 'Urgent', 
        color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        dot: 'bg-red-500'
    },
    medium: { 
        label: 'Moderate', 
        color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
        dot: 'bg-amber-500'
    },
    low: { 
        label: 'Low', 
        color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        dot: 'bg-green-500'
    },
};

// Modern Impact Configuration
const IMPACT_CONFIG = {
    critical: { 
        label: 'Critical Impact', 
        color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        description: 'Severe damage or danger'
    },
    major: { 
        label: 'Major Impact', 
        color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
        description: 'Significant damage'
    },
    moderate: { 
        label: 'Moderate Impact', 
        color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
        description: 'Noticeable damage'
    },
    minor: { 
        label: 'Minor Impact', 
        color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        description: 'Minimal damage'
    },
};

// Modern Affected People Configuration
const AFFECTED_PEOPLE_CONFIG = {
    community: {
        icon: Users,
        label: 'Entire Community',
        description: 'Affects the whole community'
    },
    multiple: {
        icon: Users,
        label: 'Multiple People',
        description: 'Affects several people'
    },
    individual: {
        icon: User,
        label: 'Individual',
        description: 'Affects one person'
    },
};

interface ReportEvidence {
    id: number;
    file_path: string;
    file_name: string;
    file_type: string;
    file_size: number;
    uploaded_by: number;
    notes: string | null;
    created_at: string;
    updated_at: string;
    file_url: string;
    is_image: boolean;
    formatted_size: string;
}

interface ReportUser {
    id: number;
    name: string;
    email: string;
    phone: string;
    address: string;
}

interface ReportType {
    id: number;
    name: string;
    icon: string;
    color: string;
}

interface Report {
    id: number;
    report_number: string;
    report_type_id: number;
    report_type: ReportType;
    title: string;
    description: string;
    detailed_description: string;
    location: string;
    incident_date: string;
    incident_time: string | null;
    urgency_level: 'low' | 'medium' | 'high';
    status: 'pending' | 'under_review' | 'assigned' | 'in_progress' | 'resolved' | 'rejected';
    priority: 'low' | 'medium' | 'high' | 'critical';
    is_anonymous: boolean;
    reporter_name: string;
    reporter_contact: string | null;
    reporter_address: string | null;
    recurring_issue: boolean;
    affected_people: 'individual' | 'multiple' | 'community';
    estimated_affected_count: number;
    impact_level: 'minor' | 'moderate' | 'major' | 'critical';
    safety_concern: boolean;
    environmental_impact: boolean;
    evidences: ReportEvidence[];
    resolution_notes: string | null;
    resolved_at: string | null;
    acknowledged_at: string | null;
    assigned_to: number | null;
    created_at: string;
    updated_at: string;
    user_id: number;
    user: ReportUser;
    canEdit: boolean;
    assigned_to_user: {
        id: number;
        name: string;
        role: string;
    } | null;
}

interface Props {
    report: Report;
}

// Modern File Size Formatter
const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Modern Date Formatters
const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Not set';
    try {
        return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
        return 'Invalid date';
    }
};

const formatDateTime = (dateString: string | null): string => {
    if (!dateString) return 'Not set';
    try {
        return format(new Date(dateString), 'MMM dd, yyyy · hh:mm a');
    } catch {
        return 'Invalid date';
    }
};

const formatTime = (timeString: string | null): string => {
    if (!timeString) return 'Not specified';
    try {
        return format(new Date(`2000-01-01T${timeString}`), 'hh:mm a');
    } catch {
        return 'Invalid time';
    }
};

// Modern Icon Mapper
const getIcon = (iconName: string) => {
    const iconMap: Record<string, any> = {
        'alert-circle': AlertCircle,
        'megaphone': Volume2,
        'volume-2': Volume2,
        'gavel': Bell,
        'users': Users,
        'zap': Zap,
        'trash-2': Trash2,
        'droplets': HeartPulse,
        'wrench': Construction,
        'building': Building,
        'bell': Bell,
        'construction': Construction,
        'car': Car,
        'paw-print': PawPrint,
        'heart-pulse': HeartPulse,
        'store': Store,
        'volume': Volume2,
        'user-x': User,
        'handshake': Users,
    };
    return iconMap[iconName] || AlertCircle;
};

// Modern File Icon Helper
const getFileIcon = (fileType: string, isImage: boolean) => {
    if (isImage) return Image;
    if (fileType.includes('pdf')) return FileText;
    if (fileType.includes('video')) return FileVideo;
    return File;
};

// Modern Document Thumbnail Component
const ModernEvidenceThumbnail = ({ 
    evidence,
    onView,
    onDownload,
    onDelete,
    canEdit,
    isDeleting 
}: { 
    evidence: ReportEvidence;
    onView: () => void;
    onDownload: () => void;
    onDelete?: () => void;
    canEdit: boolean;
    isDeleting?: boolean;
}) => {
    const FileIcon = getFileIcon(evidence.file_type, evidence.is_image);
    const [imageError, setImageError] = useState(false);

    return (
        <div className="relative group cursor-pointer active:scale-[0.98] transition-all duration-300">
            {evidence.is_image ? (
                <div 
                    className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 shadow-sm group-hover:shadow-md transition-all"
                    onClick={onView}
                >
                    <img
                        src={evidence.file_url}
                        alt={evidence.file_name}
                        className="h-32 sm:h-40 w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={() => setImageError(true)}
                        loading="lazy"
                    />
                    {imageError && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                            <Image className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-black/50 backdrop-blur-sm text-white p-2 rounded-full">
                            <Eye className="h-4 w-4" />
                        </div>
                    </div>
                </div>
            ) : (
                <div 
                    className="h-32 sm:h-40 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 flex flex-col items-center justify-center p-4 group-hover:shadow-md group-hover:border-gray-300 dark:group-hover:border-gray-600 transition-all duration-300"
                    onClick={onView}
                >
                    <FileIcon className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400 mb-2" />
                    <p className="text-xs text-gray-600 dark:text-gray-400 text-center truncate w-full px-1 font-medium">
                        {evidence.file_name}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                        {formatFileSize(evidence.file_size)}
                    </p>
                </div>
            )}
            
            <div className="absolute top-2 right-2 flex gap-1">
                <Badge variant="secondary" className={cn(
                    "text-[10px] px-2 py-0.5 backdrop-blur-sm",
                    evidence.is_image && "bg-blue-500/90 text-white",
                    evidence.file_type.includes('pdf') && "bg-red-500/90 text-white",
                    !evidence.is_image && !evidence.file_type.includes('pdf') && "bg-gray-500/90 text-white"
                )}>
                    {evidence.is_image ? 'Image' : evidence.file_type.includes('pdf') ? 'PDF' : 'Document'}
                </Badge>
            </div>

            {/* Action Buttons Overlay */}
            <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Button
                    variant="secondary"
                    size="sm"
                    className="h-7 w-7 p-0 rounded-lg bg-white/90 backdrop-blur-sm hover:bg-white"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDownload();
                    }}
                >
                    <Download className="h-3 w-3" />
                </Button>
                {canEdit && (
                    <Button
                        variant="destructive"
                        size="sm"
                        className="h-7 w-7 p-0 rounded-lg bg-red-500/90 backdrop-blur-sm hover:bg-red-600"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete?.();
                        }}
                        disabled={isDeleting}
                    >
                        {isDeleting ? (
                            <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Trash2 className="h-3 w-3" />
                        )}
                    </Button>
                )}
            </div>

            {evidence.notes && (
                <div className="absolute bottom-2 left-2">
                    <Badge variant="outline" className="text-[10px] bg-white/90 backdrop-blur-sm">
                        <Paperclip className="h-2 w-2 mr-1" />
                        Note
                    </Badge>
                </div>
            )}
        </div>
    );
};

export default function ShowReport({ report }: Props) {
    const [activeTab, setActiveTab] = useState('details');
    const [isMobile, setIsMobile] = useState(false);
    const [showActionsSheet, setShowActionsSheet] = useState(false);
    const [showStatusDetails, setShowStatusDetails] = useState(false);
    const [deletingEvidence, setDeletingEvidence] = useState<number | null>(null);

    // Check mobile viewport
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const getStatusConfig = (status: string) => {
        return STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
    };

    const getPriorityConfig = (priority: string) => {
        return PRIORITY_CONFIG[priority as keyof typeof PRIORITY_CONFIG] || PRIORITY_CONFIG.low;
    };

    const getUrgencyBadge = (urgency: string) => {
        const config = URGENCY_CONFIG[urgency as keyof typeof URGENCY_CONFIG];
        if (!config) return null;
        
        return (
            <Badge variant="outline" className={`${config.color} border-0 flex items-center gap-1 text-xs`}>
                <span className={`h-2 w-2 rounded-full ${config.dot} mr-1`}></span>
                {config.label}
            </Badge>
        );
    };

    const getImpactBadge = (impact: string) => {
        const config = IMPACT_CONFIG[impact as keyof typeof IMPACT_CONFIG];
        if (!config) return null;
        
        return (
            <Badge className={`${config.color} border-0 text-xs`}>
                {config.label}
            </Badge>
        );
    };

    const getAffectedPeopleConfig = (affected: string) => {
        return AFFECTED_PEOPLE_CONFIG[affected as keyof typeof AFFECTED_PEOPLE_CONFIG] || AFFECTED_PEOPLE_CONFIG.individual;
    };

    const handlePrint = () => {
        window.print();
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: `Community Report: ${report.title}`,
                text: `Report #${report.report_number} - ${report.title}`,
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast.success('Link copied to clipboard!');
        }
    };

    const handleDeleteEvidence = (evidenceId: number) => {
        if (!confirm('Are you sure you want to delete this evidence file?')) {
            return;
        }

        if (!report.canEdit) {
            toast.error('You cannot delete evidence from a non-pending report');
            return;
        }

        setDeletingEvidence(evidenceId);
        
        router.delete(`/portal/community-reports/${report.id}/evidence/${evidenceId}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Evidence deleted successfully');
                setDeletingEvidence(null);
            },
            onError: () => {
                toast.error('Failed to delete evidence');
                setDeletingEvidence(null);
            }
        });
    };

    const downloadEvidence = (evidence: ReportEvidence) => {
        const link = document.createElement('a');
        link.href = evidence.file_url;
        link.download = evidence.file_name;
        link.click();
    };

    // Modern Status Banner Component
    const ModernStatusBanner = () => {
        const config = getStatusConfig(report.status);
        const Icon = config.icon;
        const PriorityIcon = getPriorityConfig(report.priority).icon;
        
        return (
            <Alert className={cn(
                "border-0 rounded-xl shadow-lg",
                config.gradient
            )}>
                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
                        <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                        <AlertTitle className="font-semibold text-sm sm:text-base flex items-center gap-2">
                            Status: {config.label}
                            <Badge className={cn(getPriorityConfig(report.priority).color, "border-0 ml-2")}>
                                <PriorityIcon className="h-3 w-3 mr-1" />
                                {report.priority.toUpperCase()}
                            </Badge>
                        </AlertTitle>
                        <AlertDescription className="text-xs sm:text-sm mt-1">
                            {config.description}
                        </AlertDescription>
                        {report.assigned_to_user && (
                            <div className="mt-2 flex items-center gap-2 text-xs">
                                <Users className="h-3 w-3" />
                                <span>Assigned to: <strong>{report.assigned_to_user.name}</strong></span>
                                {report.assigned_to_user.role && (
                                    <Badge variant="outline" className="text-[10px]">
                                        {report.assigned_to_user.role}
                                    </Badge>
                                )}
                            </div>
                        )}
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowStatusDetails(!showStatusDetails)}
                        className="h-8 w-8 p-0 rounded-xl"
                    >
                        {showStatusDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                </div>

                {/* Expanded Details */}
                {showStatusDetails && (
                    <div className="mt-4 pt-4 border-t border-white/20 dark:border-gray-700/50 space-y-3 animate-slide-down">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Reported Date</p>
                                <p className="font-medium text-sm">{formatDateTime(report.created_at)}</p>
                            </div>
                            {report.acknowledged_at && (
                                <div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Acknowledged</p>
                                    <p className="font-medium text-sm">{formatDateTime(report.acknowledged_at)}</p>
                                </div>
                            )}
                            {report.resolved_at && (
                                <div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Resolved</p>
                                    <p className="font-medium text-sm">{formatDateTime(report.resolved_at)}</p>
                                </div>
                            )}
                            <div>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Last Updated</p>
                                <p className="font-medium text-sm">{formatDateTime(report.updated_at)}</p>
                            </div>
                        </div>
                        {report.resolution_notes && (
                            <div className="p-3 rounded-lg bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
                                <p className="text-xs font-medium mb-1">Resolution Notes</p>
                                <p className="text-sm">{report.resolution_notes}</p>
                            </div>
                        )}
                    </div>
                )}
            </Alert>
        );
    };

    // Modern Report Info Card
    const ModernReportInfoCard = () => {
        const TypeIcon = getIcon(report.report_type?.icon || 'alert-circle');
        const AffectedConfig = getAffectedPeopleConfig(report.affected_people);
        const AffectedIcon = AffectedConfig.icon;
        
        return (
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base lg:text-lg flex items-center gap-2">
                        <div 
                            className="h-8 w-8 rounded-xl flex items-center justify-center"
                            style={{ 
                                background: report.report_type?.color ? `${report.report_type.color}20` : '#e0f2fe',
                                color: report.report_type?.color || '#0369a1'
                            }}
                        >
                            <TypeIcon className="h-4 w-4" />
                        </div>
                        <div>
                            <span className="block">{report.report_type?.name || 'Unknown Type'}</span>
                            <CardDescription className="text-xs">#{report.report_number}</CardDescription>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Title and Description */}
                    <div>
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                            {report.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
                            {report.description}
                        </p>
                        {report.detailed_description && (
                            <div className="mt-3 p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                                <h4 className="font-medium text-sm mb-2">Additional Details</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
                                    {report.detailed_description}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Location and Date */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                            <div className="flex items-center gap-2 mb-1">
                                <MapPin className="h-4 w-4 text-gray-400" />
                                <p className="text-xs text-gray-500">Location</p>
                            </div>
                            <p className="font-medium text-sm">{report.location}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                            <div className="flex items-center gap-2 mb-1">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <p className="text-xs text-gray-500">Incident Date</p>
                            </div>
                            <p className="font-medium text-sm">{formatDate(report.incident_date)}</p>
                            {report.incident_time && (
                                <p className="text-xs text-gray-500 mt-1">{formatTime(report.incident_time)}</p>
                            )}
                        </div>
                    </div>

                    {/* Impact and Urgency */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                            <p className="text-xs text-gray-500 mb-2">Urgency Level</p>
                            {getUrgencyBadge(report.urgency_level)}
                        </div>
                        <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                            <p className="text-xs text-gray-500 mb-2">Impact Level</p>
                            {getImpactBadge(report.impact_level)}
                        </div>
                    </div>

                    {/* Concerns */}
                    {(report.safety_concern || report.environmental_impact || report.recurring_issue) && (
                        <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                            <p className="text-xs text-gray-500 mb-2">Concerns</p>
                            <div className="flex flex-wrap gap-2">
                                {report.safety_concern && (
                                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                        <AlertTriangle className="h-3 w-3 mr-1" />
                                        Safety Concern
                                    </Badge>
                                )}
                                {report.environmental_impact && (
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                        <HeartPulse className="h-3 w-3 mr-1" />
                                        Environmental Impact
                                    </Badge>
                                )}
                                {report.recurring_issue && (
                                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                        <History className="h-3 w-3 mr-1" />
                                        Recurring Issue
                                    </Badge>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Affected People */}
                    <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                        <p className="text-xs text-gray-500 mb-2">Affected People</p>
                        <div className="flex items-center gap-2">
                            <AffectedIcon className="h-4 w-4 text-gray-500" />
                            <span className="font-medium text-sm">{AffectedConfig.label}</span>
                            <Badge variant="outline" className="text-xs">
                                {report.estimated_affected_count} people
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    };

    // Modern Evidence Card
    const ModernEvidenceCard = () => {
        if (!report.evidences || report.evidences.length === 0) {
            return (
                <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base lg:text-lg flex items-center gap-2">
                            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                                <Paperclip className="h-4 w-4 text-white" />
                            </div>
                            Supporting Evidence
                        </CardTitle>
                        <CardDescription>No evidence files attached</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-8">
                            <File className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                            <h4 className="font-medium text-gray-900 dark:text-white mb-1">No Evidence Attached</h4>
                            <p className="text-sm text-gray-500">No supporting files were uploaded with this report</p>
                            {report.canEdit && (
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="mt-4 gap-2 rounded-xl"
                                    asChild
                                >
                                    <Link href={`/portal/community-reports/${report.id}/edit`}>
                                        <Paperclip className="h-4 w-4" />
                                        Add Evidence
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            );
        }

        return (
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base lg:text-lg flex items-center gap-2">
                        <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                            <Paperclip className="h-4 w-4 text-white" />
                        </div>
                        Supporting Evidence
                    </CardTitle>
                    <CardDescription>
                        {report.evidences.length} file{report.evidences.length !== 1 ? 's' : ''} attached
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {report.evidences.map((evidence) => (
                            <div key={evidence.id} className="space-y-2">
                                <ModernEvidenceThumbnail
                                    evidence={evidence}
                                    onView={() => window.open(evidence.file_url, '_blank')}
                                    onDownload={() => downloadEvidence(evidence)}
                                    onDelete={() => handleDeleteEvidence(evidence.id)}
                                    canEdit={report.canEdit}
                                    isDeleting={deletingEvidence === evidence.id}
                                />
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-medium truncate flex-1">
                                        {evidence.file_name}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {report.canEdit && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full gap-2 rounded-xl"
                                asChild
                            >
                                <Link href={`/portal/community-reports/${report.id}/edit`}>
                                    <Paperclip className="h-4 w-4" />
                                    Add More Evidence
                                </Link>
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    };

    // Modern Timeline Card
    const ModernTimelineCard = () => (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50">
            <CardHeader className="pb-2">
                <CardTitle className="text-base lg:text-lg flex items-center gap-2">
                    <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
                        <History className="h-4 w-4 text-white" />
                    </div>
                    Report Timeline
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="relative">
                    {/* Timeline line with gradient */}
                    <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-gray-200 dark:from-blue-400 dark:to-gray-700"></div>
                    
                    <div className="space-y-6">
                        {/* Submitted */}
                        <div className="relative pl-10">
                            <div className="absolute left-4 top-1.5">
                                <div className="h-3 w-3 rounded-full bg-blue-500 ring-4 ring-blue-100 dark:ring-blue-900/30"></div>
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className="font-semibold text-sm">Report Submitted</h4>
                                    <span className="text-xs text-gray-500">{formatDateTime(report.created_at)}</span>
                                </div>
                                <p className="text-xs text-gray-600">Report was submitted successfully</p>
                            </div>
                        </div>

                        {/* Acknowledged */}
                        {report.acknowledged_at && (
                            <div className="relative pl-10">
                                <div className="absolute left-4 top-1.5">
                                    <div className="h-3 w-3 rounded-full bg-blue-500 ring-4 ring-blue-100 dark:ring-blue-900/30"></div>
                                </div>
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <h4 className="font-semibold text-sm">Report Acknowledged</h4>
                                        <span className="text-xs text-gray-500">{formatDateTime(report.acknowledged_at)}</span>
                                    </div>
                                    <p className="text-xs text-gray-600">Report was received and acknowledged</p>
                                </div>
                            </div>
                        )}

                        {/* Under Review */}
                        {['under_review', 'assigned', 'in_progress', 'resolved', 'rejected'].includes(report.status) && (
                            <div className="relative pl-10">
                                <div className="absolute left-4 top-1.5">
                                    <div className="h-3 w-3 rounded-full bg-blue-500 ring-4 ring-blue-100 dark:ring-blue-900/30"></div>
                                </div>
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <h4 className="font-semibold text-sm">Under Review</h4>
                                        <span className="text-xs text-gray-500">{formatDateTime(report.updated_at)}</span>
                                    </div>
                                    <p className="text-xs text-gray-600">Report is being reviewed by officials</p>
                                </div>
                            </div>
                        )}

                        {/* Assigned */}
                        {['assigned', 'in_progress', 'resolved'].includes(report.status) && report.assigned_to_user && (
                            <div className="relative pl-10">
                                <div className="absolute left-4 top-1.5">
                                    <div className="h-3 w-3 rounded-full bg-purple-500 ring-4 ring-purple-100 dark:ring-purple-900/30"></div>
                                </div>
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <h4 className="font-semibold text-sm">Assigned</h4>
                                        <span className="text-xs text-gray-500">After review</span>
                                    </div>
                                    <p className="text-xs text-gray-600">
                                        Assigned to {report.assigned_to_user.name}
                                        {report.assigned_to_user.role && ` (${report.assigned_to_user.role})`}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Current Status */}
                        <div className="relative pl-10">
                            <div className="absolute left-4 top-1.5">
                                <div className={cn(
                                    "h-3 w-3 rounded-full ring-4",
                                    report.status === 'resolved' ? 'bg-green-500 ring-green-100 dark:ring-green-900/30' :
                                    report.status === 'rejected' ? 'bg-red-500 ring-red-100 dark:ring-red-900/30' :
                                    'bg-blue-500 ring-blue-100 dark:ring-blue-900/30'
                                )}></div>
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className="font-semibold text-sm capitalize">
                                        {report.status.replace('_', ' ')}
                                    </h4>
                                    {report.resolved_at && (
                                        <span className="text-xs text-gray-500">{formatDateTime(report.resolved_at)}</span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-600">
                                    {report.status === 'resolved' 
                                        ? 'The report has been resolved successfully'
                                        : report.status === 'rejected'
                                        ? 'The report has been rejected'
                                        : 'Awaiting further action'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    // Modern Reporter Info Card
    const ModernReporterInfoCard = () => (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50">
            <CardHeader className="pb-2">
                <CardTitle className="text-base lg:text-lg flex items-center gap-2">
                    <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                    </div>
                    Reporter Information
                </CardTitle>
            </CardHeader>
            <CardContent>
                {report.is_anonymous ? (
                    <div className="text-center py-4">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center mx-auto mb-3">
                            <Shield className="h-8 w-8 text-gray-400" />
                        </div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Anonymous Report</h4>
                        <p className="text-sm text-gray-500 mt-1">Reporter's identity is protected</p>
                        <div className="mt-4 p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 text-left">
                            <p className="text-xs text-gray-500">Name</p>
                            <p className="text-sm font-medium mb-2">{report.reporter_name}</p>
                            {report.reporter_contact && (
                                <>
                                    <p className="text-xs text-gray-500">Contact</p>
                                    <p className="text-sm font-medium mb-2">********</p>
                                </>
                            )}
                            {report.reporter_address && (
                                <>
                                    <p className="text-xs text-gray-500">Address</p>
                                    <p className="text-sm font-medium">********</p>
                                </>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                            <p className="text-xs text-gray-500 mb-1">Name</p>
                            <p className="font-medium text-sm">{report.reporter_name}</p>
                        </div>
                        {report.reporter_contact && (
                            <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                                <p className="text-xs text-gray-500 mb-1">Contact</p>
                                <p className="font-medium text-sm">{report.reporter_contact}</p>
                            </div>
                        )}
                        {report.reporter_address && (
                            <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                                <p className="text-xs text-gray-500 mb-1">Address</p>
                                <p className="font-medium text-sm">{report.reporter_address}</p>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );

    // Modern Quick Actions Card
    const ModernQuickActionsCard = () => (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50">
            <CardHeader className="pb-2">
                <CardTitle className="text-base lg:text-lg flex items-center gap-2">
                    <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                        <Zap className="h-4 w-4 text-white" />
                    </div>
                    Quick Actions
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                {report.canEdit && (
                    <Button 
                        variant="default"
                        className="w-full justify-start gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600"
                        asChild
                    >
                        <Link href={`/portal/community-reports/${report.id}/edit`}>
                            <FileText className="h-4 w-4" />
                            Edit Report
                        </Link>
                    </Button>
                )}
                <Button 
                    variant="outline" 
                    className="w-full justify-start gap-2 rounded-xl"
                    onClick={handlePrint}
                >
                    <Printer className="h-4 w-4" />
                    Print Details
                </Button>
                <Button 
                    variant="outline" 
                    className="w-full justify-start gap-2 rounded-xl"
                    onClick={handleShare}
                >
                    <Share2 className="h-4 w-4" />
                    Share Report
                </Button>
                {report.canEdit && (
                    <Button 
                        variant="destructive" 
                        className="w-full justify-start gap-2 rounded-xl"
                        asChild
                    >
                        <Link 
                            href={`/portal/community-reports/${report.id}`} 
                            method="delete"
                            as="button"
                            type="button"
                            onClick={(e) => {
                                if (!confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
                                    e.preventDefault();
                                }
                            }}
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete Report
                        </Link>
                    </Button>
                )}
            </CardContent>
        </Card>
    );

    // Modern Help Card
    const ModernHelpCard = () => (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50">
            <CardHeader className="pb-2">
                <CardTitle className="text-base lg:text-lg flex items-center gap-2">
                    <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                        <HelpCircle className="h-4 w-4 text-white" />
                    </div>
                    Need Help?
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 flex items-center gap-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                        <p className="font-medium text-sm">Emergency Hotline</p>
                        <p className="text-xs text-gray-500">911</p>
                    </div>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 flex items-center gap-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                        <p className="font-medium text-sm">Barangay Hotline</p>
                        <p className="text-xs text-gray-500">(02) 123-4567</p>
                    </div>
                </div>
                <Button variant="outline" className="w-full rounded-xl" asChild>
                    <Link href="/resident/support">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Contact Support
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );

    // Mobile Tab Navigation
    const MobileTabNavigation = () => {
        const tabs = [
            { id: 'details', label: 'Details', icon: FileText },
            { id: 'evidence', label: 'Evidence', icon: Paperclip },
            { id: 'timeline', label: 'Timeline', icon: History },
            { id: 'help', label: 'Help', icon: HelpCircle },
        ];

        return (
            <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl py-2 -mx-4 px-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                className={cn(
                                    "flex-1 py-2 px-1 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1",
                                    activeTab === tab.id
                                        ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                                )}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <Icon className="h-3.5 w-3.5" />
                                <span className="hidden xs:inline">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    // Mobile Tab Content
    const MobileTabContent = () => {
        switch (activeTab) {
            case 'details':
                return (
                    <div className="space-y-4 animate-fade-in">
                        <ModernReportInfoCard />
                        <ModernReporterInfoCard />
                    </div>
                );
            case 'evidence':
                return (
                    <div className="space-y-4 animate-fade-in">
                        <ModernEvidenceCard />
                    </div>
                );
            case 'timeline':
                return (
                    <div className="space-y-4 animate-fade-in">
                        <ModernTimelineCard />
                        {report.canEdit && <ModernQuickActionsCard />}
                    </div>
                );
            case 'help':
                return (
                    <div className="space-y-4 animate-fade-in">
                        <ModernHelpCard />
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <ResidentLayout
            title={`Report #${report.report_number}`}
            breadcrumbs={[
                { title: 'Dashboard', href: '/portal/dashboard' },
                { title: 'My Reports', href: '/portal/community-reports' },
                { title: `#${report.report_number}`, href: `/portal/community-reports/${report.id}` }
            ]}
            showMobileHeader={true}
        >
            <div className="space-y-4 md:space-y-6 animate-fade-in pb-20 md:pb-6">
                {/* Mobile Header */}
                {isMobile && (
                    <div className="flex items-center justify-between sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl z-10 py-3 px-4 -mx-4 border-b border-gray-200 dark:border-gray-800">
                        <div className="flex items-center gap-2">
                            <Link href="/portal/community-reports">
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-xl">
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-lg font-bold truncate max-w-[180px]">
                                    #{report.report_number}
                                </h1>
                                <p className="text-xs text-gray-500 truncate max-w-[180px]">
                                    {report.title}
                                </p>
                            </div>
                        </div>
                        <Sheet open={showActionsSheet} onOpenChange={setShowActionsSheet}>
                            <SheetTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-xl">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="bottom" className="rounded-t-xl">
                                <SheetHeader className="mb-4">
                                    <SheetTitle>Actions</SheetTitle>
                                </SheetHeader>
                                <div className="space-y-2">
                                    {report.canEdit && (
                                        <Button 
                                            variant="outline" 
                                            className="w-full justify-start gap-2 rounded-xl"
                                            asChild
                                        >
                                            <Link href={`/portal/community-reports/${report.id}/edit`}>
                                                <FileText className="h-4 w-4" />
                                                Edit Report
                                            </Link>
                                        </Button>
                                    )}
                                    <Button variant="outline" className="w-full justify-start gap-2 rounded-xl" onClick={handlePrint}>
                                        <Printer className="h-4 w-4" />
                                        Print
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start gap-2 rounded-xl" onClick={handleShare}>
                                        <Share2 className="h-4 w-4" />
                                        Share
                                    </Button>
                                    <Link href="/portal/community-reports">
                                        <Button variant="outline" className="w-full justify-start gap-2 rounded-xl">
                                            <ArrowLeft className="h-4 w-4" />
                                            Back to Reports
                                        </Button>
                                    </Link>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                )}

                {/* Desktop Header */}
                {!isMobile && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Link href="/portal/community-reports">
                                <Button variant="ghost" size="sm" className="gap-2 rounded-xl">
                                    <ArrowLeft className="h-4 w-4" />
                                    Back to Reports
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                                    Report #{report.report_number}
                                </h1>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">
                                    Filed on {formatDateTime(report.created_at)}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2 rounded-xl">
                                <Printer className="h-4 w-4" />
                                Print
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleShare} className="gap-2 rounded-xl">
                                <Share2 className="h-4 w-4" />
                                Share
                            </Button>
                        </div>
                    </div>
                )}

                {/* Status Banner */}
                <ModernStatusBanner />

                {/* Main Content */}
                <div className="grid gap-4 lg:grid-cols-3">
                    {/* Left Column - Main Content */}
                    <div className="lg:col-span-2 space-y-4">
                        {isMobile ? (
                            <>
                                <MobileTabNavigation />
                                <MobileTabContent />
                            </>
                        ) : (
                            /* Desktop Layout */
                            <div className="space-y-4">
                                <ModernReportInfoCard />
                                <ModernEvidenceCard />
                                <ModernTimelineCard />
                            </div>
                        )}
                    </div>

                    {/* Right Column - Sidebar (Desktop Only) */}
                    {!isMobile && (
                        <div className="space-y-4">
                            <ModernReporterInfoCard />
                            {report.canEdit && <ModernQuickActionsCard />}
                            <ModernHelpCard />
                        </div>
                    )}
                </div>

                {/* Mobile Bottom Actions */}
                {isMobile && report.canEdit && (
                    <div className="fixed bottom-0 left-0 right-0 z-40 safe-bottom animate-slide-up">
                        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 p-3 shadow-lg">
                            <div className="flex gap-2">
                                <Button 
                                    className="flex-1 gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600"
                                    size="default"
                                    asChild
                                >
                                    <Link href={`/portal/community-reports/${report.id}/edit`}>
                                        <FileText className="h-4 w-4" />
                                        Edit
                                    </Link>
                                </Button>
                                <Button 
                                    variant="destructive" 
                                    size="default" 
                                    className="flex-1 gap-2 rounded-xl"
                                    asChild
                                >
                                    <Link 
                                        href={`/portal/community-reports/${report.id}`} 
                                        method="delete"
                                        as="button"
                                        type="button"
                                        onClick={(e) => {
                                            if (!confirm('Are you sure you want to delete this report?')) {
                                                e.preventDefault();
                                            }
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Delete
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Desktop Footer Actions */}
                {!isMobile && report.canEdit && (
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                        <Link href={`/portal/community-reports/${report.id}/edit`}>
                            <Button className="gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600">
                                <FileText className="h-4 w-4" />
                                Edit Report
                            </Button>
                        </Link>
                    </div>
                )}
            </div>

            {/* Print Styles */}
            <style>
                {`
                    @media print {
                        .no-print,
                        .md\\:hidden,
                        .fixed,
                        button,
                        [role="button"],
                        .tabs-trigger,
                        a[href^="/portal/community-reports"]:not(.print-link) {
                            display: none !important;
                        }
                        
                        body {
                            font-size: 12pt;
                            padding: 0;
                            margin: 0;
                        }
                        
                        .print-content {
                            margin: 0;
                            padding: 20px;
                        }
                        
                        .border {
                            border: 1px solid #e5e7eb !important;
                        }
                        
                        .card {
                            break-inside: avoid;
                            margin-bottom: 16px !important;
                        }
                        
                        .grid {
                            display: block !important;
                        }
                        
                        .lg\\:col-span-2 {
                            width: 100% !important;
                        }
                        
                        .space-y-4 > * + * {
                            margin-top: 1rem !important;
                        }
                    }
                `}
            </style>
        </ResidentLayout>
    );
}