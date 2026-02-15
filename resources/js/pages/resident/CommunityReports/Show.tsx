import ResidentLayout from '@/layouts/resident-app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
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
    Building
} from 'lucide-react';
import { Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';

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

    const getPriorityConfig = (priority: string) => {
        switch (priority) {
            case 'critical': 
                return {
                    color: 'bg-red-100 text-red-800 border-red-200',
                    icon: AlertCircle,
                    text: 'Immediate attention required',
                    dot: 'bg-red-500'
                };
            case 'high': 
                return {
                    color: 'bg-orange-100 text-orange-800 border-orange-200',
                    icon: AlertTriangle,
                    text: 'High attention required',
                    dot: 'bg-orange-500'
                };
            case 'medium': 
                return {
                    color: 'bg-amber-100 text-amber-800 border-amber-200',
                    icon: AlertTriangle,
                    text: 'Moderate attention required',
                    dot: 'bg-amber-500'
                };
            case 'low': 
                return {
                    color: 'bg-green-100 text-green-800 border-green-200',
                    icon: CheckCircle,
                    text: 'Routine attention',
                    dot: 'bg-green-500'
                };
            default: 
                return {
                    color: 'bg-gray-100 text-gray-800 border-gray-200',
                    icon: Info,
                    text: 'Standard priority',
                    dot: 'bg-gray-500'
                };
        }
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'pending': 
                return {
                    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                    icon: Clock,
                    bgColor: 'bg-yellow-50',
                    description: 'Waiting for review',
                    nextStep: 'Will be assigned for review'
                };
            case 'under_review': 
                return {
                    color: 'bg-blue-100 text-blue-800 border-blue-200',
                    icon: History,
                    bgColor: 'bg-blue-50',
                    description: 'Being investigated',
                    nextStep: 'Awaiting resolution'
                };
            case 'assigned': 
                return {
                    color: 'bg-purple-100 text-purple-800 border-purple-200',
                    icon: Users,
                    bgColor: 'bg-purple-50',
                    description: 'Assigned to personnel',
                    nextStep: 'Work in progress'
                };
            case 'in_progress': 
                return {
                    color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
                    icon: Zap,
                    bgColor: 'bg-indigo-50',
                    description: 'Work in progress',
                    nextStep: 'Awaiting completion'
                };
            case 'resolved': 
                return {
                    color: 'bg-green-100 text-green-800 border-green-200',
                    icon: CheckCircle,
                    bgColor: 'bg-green-50',
                    description: 'Successfully resolved',
                    nextStep: 'Case closed'
                };
            case 'rejected': 
                return {
                    color: 'bg-gray-100 text-gray-800 border-gray-200',
                    icon: XCircle,
                    bgColor: 'bg-gray-50',
                    description: 'Report rejected',
                    nextStep: 'No further action'
                };
            default: 
                return {
                    color: 'bg-gray-100 text-gray-800 border-gray-200',
                    icon: Info,
                    bgColor: 'bg-gray-50',
                    description: 'Unknown status',
                    nextStep: 'Contact support'
                };
        }
    };

    const getUrgencyConfig = (urgency: string) => {
        switch (urgency) {
            case 'high': 
                return {
                    color: 'bg-red-100 text-red-800 border-red-200',
                    icon: AlertCircle,
                    text: 'Urgent'
                };
            case 'medium': 
                return {
                    color: 'bg-amber-100 text-amber-800 border-amber-200',
                    icon: AlertTriangle,
                    text: 'Moderate'
                };
            case 'low': 
                return {
                    color: 'bg-green-100 text-green-800 border-green-200',
                    icon: CheckCircle,
                    text: 'Low'
                };
            default: 
                return {
                    color: 'bg-gray-100 text-gray-800 border-gray-200',
                    icon: Info,
                    text: 'Unknown'
                };
        }
    };

    const getImpactConfig = (impact: string) => {
        switch (impact) {
            case 'critical': 
                return {
                    color: 'bg-red-100 text-red-800 border-red-200',
                    text: 'Critical Impact',
                    description: 'Severe damage or danger'
                };
            case 'major': 
                return {
                    color: 'bg-orange-100 text-orange-800 border-orange-200',
                    text: 'Major Impact',
                    description: 'Significant damage'
                };
            case 'moderate': 
                return {
                    color: 'bg-amber-100 text-amber-800 border-amber-200',
                    text: 'Moderate Impact',
                    description: 'Noticeable damage'
                };
            case 'minor': 
                return {
                    color: 'bg-green-100 text-green-800 border-green-200',
                    text: 'Minor Impact',
                    description: 'Minimal damage'
                };
            default: 
                return {
                    color: 'bg-gray-100 text-gray-800 border-gray-200',
                    text: 'Unknown Impact',
                    description: 'Impact not specified'
                };
        }
    };

    const getAffectedPeopleConfig = (affected: string) => {
        switch (affected) {
            case 'community': 
                return {
                    icon: Users,
                    text: 'Entire Community',
                    description: 'Affects the whole community'
                };
            case 'multiple': 
                return {
                    icon: Users,
                    text: 'Multiple People',
                    description: 'Affects several people'
                };
            case 'individual': 
                return {
                    icon: User,
                    text: 'Individual',
                    description: 'Affects one person'
                };
            default: 
                return {
                    icon: User,
                    text: 'Unknown',
                    description: 'Affected people not specified'
                };
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        try {
            return format(new Date(dateString), 'MMM dd, yyyy');
        } catch {
            return 'Invalid date';
        }
    };

    const formatDateTime = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        try {
            return format(new Date(dateString), 'MMM dd, yyyy · hh:mm a');
        } catch {
            return 'Invalid date';
        }
    };

    const formatTime = (timeString: string | null) => {
        if (!timeString) return 'Not specified';
        try {
            return format(new Date(`2000-01-01T${timeString}`), 'hh:mm a');
        } catch {
            return 'Invalid time';
        }
    };

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

    const getFileIcon = (fileType: string, isImage: boolean) => {
        if (isImage) return Image;
        if (fileType.includes('pdf')) return FileText;
        if (fileType.includes('video')) return FileVideo;
        return FileText;
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
        
        router.delete(`/resident/community-reports/${report.id}/evidence/${evidenceId}`, {
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

    const StatusBanner = () => {
        const config = getStatusConfig(report.status);
        const Icon = config.icon;
        
        return (
            <Card className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                    <div className="space-y-4">
                        {/* Status Header */}
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${config.bgColor}`}>
                                    <Icon className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Report Status</h3>
                                    <Badge className={`${config.color} gap-1`}>
                                        <Icon className="h-3 w-3" />
                                        {report.status.replace('_', ' ').toUpperCase()}
                                    </Badge>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="p-1 h-8 w-8"
                                onClick={() => setShowStatusDetails(!showStatusDetails)}
                            >
                                {showStatusDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>
                        </div>

                        {/* Status Details (Collapsible) */}
                        {showStatusDetails && (
                            <div className="space-y-3 pt-3 border-t">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Priority</p>
                                        <Badge className={`${getPriorityConfig(report.priority).color} gap-1 mt-1`}>
                                            <span className={`h-2 w-2 rounded-full ${getPriorityConfig(report.priority).dot}`}></span>
                                            {report.priority.toUpperCase()}
                                        </Badge>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Reported Date</p>
                                        <p className="font-medium">{formatDateTime(report.created_at)}</p>
                                    </div>
                                </div>
                                
                                {report.assigned_to_user && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4 text-blue-600" />
                                            <div>
                                                <span className="text-sm font-medium text-blue-800">
                                                    Assigned to: {report.assigned_to_user.name}
                                                </span>
                                                {report.assigned_to_user.role && (
                                                    <span className="text-xs text-blue-600 ml-2">
                                                        ({report.assigned_to_user.role})
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                {report.status === 'resolved' && report.resolved_at && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                            <span className="text-sm font-medium text-green-800">
                                                Resolved on {formatDateTime(report.resolved_at)}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    };

    const ReportInfoCard = () => {
        const TypeIcon = getIcon(report.report_type?.icon || 'alert-circle');
        
        return (
            <Card>
                <CardHeader className="p-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg" style={{ backgroundColor: report.report_type?.color ? `${report.report_type.color}20` : '#e0f2fe' }}>
                            <TypeIcon className="h-5 w-5" style={{ color: report.report_type?.color || '#0369a1' }} />
                        </div>
                        <div>
                            <CardTitle className="text-base">{report.report_type?.name || 'Unknown Type'}</CardTitle>
                            <CardDescription className="text-sm">#{report.report_number}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-4">
                    {/* Title */}
                    <div>
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-2">
                            {report.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">
                            {report.description}
                        </p>
                        {report.detailed_description && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                <h4 className="font-medium text-sm text-gray-700 mb-2">Additional Details</h4>
                                <p className="text-sm text-gray-600 whitespace-pre-line">
                                    {report.detailed_description}
                                </p>
                            </div>
                        )}
                    </div>

                    <Separator />

                    {/* Report Details */}
                    <div className="space-y-3">
                        <div className="flex items-start gap-3">
                            <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-500">Location</p>
                                <p className="font-medium text-gray-900 dark:text-gray-100">{report.location}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-start gap-3">
                                <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-500">Incident Date</p>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">
                                        {formatDate(report.incident_date)}
                                    </p>
                                </div>
                            </div>
                            {report.incident_time && (
                                <div className="flex items-start gap-3">
                                    <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-500">Incident Time</p>
                                        <p className="font-medium text-gray-900 dark:text-gray-100">
                                            {formatTime(report.incident_time)}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <Separator />

                    {/* Impact and Urgency */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-2">Urgency Level</p>
                            <Badge className={`${getUrgencyConfig(report.urgency_level).color} gap-1`}>
                                {getUrgencyConfig(report.urgency_level).text}
                            </Badge>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-2">Impact Level</p>
                            <Badge className={`${getImpactConfig(report.impact_level).color}`}>
                                {getImpactConfig(report.impact_level).text}
                            </Badge>
                        </div>
                    </div>

                    {/* Safety and Environmental Concerns */}
                    {(report.safety_concern || report.environmental_impact) && (
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-500">Concerns</p>
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
                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-2">Affected People</p>
                        <div className="flex items-center gap-2">
                            {(() => {
                                const config = getAffectedPeopleConfig(report.affected_people);
                                const Icon = config.icon;
                                return (
                                    <>
                                        <Icon className="h-4 w-4 text-gray-500" />
                                        <span className="font-medium">{config.text}</span>
                                        <span className="text-sm text-gray-500">({report.estimated_affected_count} people)</span>
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    };

    const EvidenceCard = () => {
        if (!report.evidences || report.evidences.length === 0) {
            return (
                <Card>
                    <CardContent className="p-6 text-center">
                        <File className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">No Evidence Attached</h4>
                        <p className="text-sm text-gray-500">No supporting files were uploaded with this report</p>
                    </CardContent>
                </Card>
            );
        }

        return (
            <Card>
                <CardHeader className="p-4">
                    <CardTitle className="text-base">Supporting Evidence</CardTitle>
                    <CardDescription>
                        {report.evidences.length} file{report.evidences.length !== 1 ? 's' : ''} attached
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <div className="space-y-3">
                        {report.evidences.map((evidence) => {
                            const FileIcon = getFileIcon(evidence.file_type, evidence.is_image);
                            return (
                                <div key={evidence.id} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                                                <FileIcon className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-medium truncate text-gray-900 dark:text-gray-100">
                                                    {evidence.file_name}
                                                </p>
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <span>{evidence.file_type}</span>
                                                    <span>•</span>
                                                    <span>{formatFileSize(evidence.file_size)}</span>
                                                    {evidence.notes && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="text-blue-600" title={evidence.notes}>
                                                                <Paperclip className="h-3 w-3 inline" /> Note
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 ml-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0"
                                                onClick={() => window.open(evidence.file_url, '_blank')}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0"
                                                onClick={() => downloadEvidence(evidence)}
                                            >
                                                <Download className="h-4 w-4" />
                                            </Button>
                                            {report.canEdit && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => handleDeleteEvidence(evidence.id)}
                                                    disabled={deletingEvidence === evidence.id}
                                                >
                                                    {deletingEvidence === evidence.id ? (
                                                        <div className="h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                                    ) : (
                                                        <Trash2 className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                    {/* Image preview for image files */}
                                    {evidence.is_image && (
                                        <div className="mt-3 rounded-md overflow-hidden border">
                                            <img 
                                                src={evidence.file_url} 
                                                alt={evidence.file_name}
                                                className="w-full h-auto max-h-48 object-contain bg-gray-50"
                                                loading="lazy"
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    
                    {/* Add more evidence button if report is editable */}
                    {report.canEdit && (
                        <div className="mt-4 pt-3 border-t">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full"
                                asChild
                            >
                                <Link href={`/resident/community-reports/${report.id}/edit`}>
                                    <Paperclip className="h-4 w-4 mr-2" />
                                    Add More Evidence
                                </Link>
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    };

    const TimelineCard = () => (
        <Card>
            <CardHeader className="p-4">
                <CardTitle className="text-base flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Report Timeline
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <div className="relative">
                    {/* Timeline Line */}
                    <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                    
                    <div className="space-y-6">
                        {/* Filed */}
                        <div className="relative pl-10">
                            <div className="absolute left-4 top-1.5">
                                <div className="w-3 h-3 bg-blue-500 rounded-full ring-4 ring-blue-100"></div>
                            </div>
                            <div>
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">Report Submitted</h4>
                                    <span className="text-xs text-gray-500">{formatDateTime(report.created_at)}</span>
                                </div>
                                <p className="text-sm text-gray-600">Report was submitted successfully</p>
                            </div>
                        </div>

                        {/* Acknowledged */}
                        {report.acknowledged_at && (
                            <div className="relative pl-10">
                                <div className="absolute left-4 top-1.5">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full ring-4 ring-blue-100"></div>
                                </div>
                                <div>
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">Report Acknowledged</h4>
                                        <span className="text-xs text-gray-500">{formatDateTime(report.acknowledged_at)}</span>
                                    </div>
                                    <p className="text-sm text-gray-600">Report was received and acknowledged</p>
                                </div>
                            </div>
                        )}

                        {/* Under Review */}
                        {['under_review', 'assigned', 'in_progress', 'resolved', 'rejected'].includes(report.status) && (
                            <div className="relative pl-10">
                                <div className="absolute left-4 top-1.5">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full ring-4 ring-blue-100"></div>
                                </div>
                                <div>
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">Under Review</h4>
                                        <span className="text-xs text-gray-500">{formatDateTime(report.updated_at)}</span>
                                    </div>
                                    <p className="text-sm text-gray-600">Report is being reviewed by officials</p>
                                </div>
                            </div>
                        )}

                        {/* Assigned */}
                        {['assigned', 'in_progress', 'resolved'].includes(report.status) && report.assigned_to_user && (
                            <div className="relative pl-10">
                                <div className="absolute left-4 top-1.5">
                                    <div className="w-3 h-3 bg-purple-500 rounded-full ring-4 ring-purple-100"></div>
                                </div>
                                <div>
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">Assigned</h4>
                                        <span className="text-xs text-gray-500">After review</span>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        Assigned to {report.assigned_to_user.name}
                                        {report.assigned_to_user.role && ` (${report.assigned_to_user.role})`}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Current Status */}
                        <div className="relative pl-10">
                            <div className="absolute left-4 top-1.5">
                                <div className={`w-3 h-3 rounded-full ring-4 ${
                                    report.status === 'resolved' ? 'bg-green-500 ring-green-100' :
                                    report.status === 'rejected' ? 'bg-red-500 ring-red-100' :
                                    'bg-blue-500 ring-blue-100'
                                }`}></div>
                            </div>
                            <div>
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 capitalize">
                                        {report.status.replace('_', ' ')}
                                    </h4>
                                    {report.resolved_at && (
                                        <span className="text-xs text-gray-500">{formatDateTime(report.resolved_at)}</span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-600">
                                    {report.status === 'resolved' 
                                        ? 'The report has been resolved successfully'
                                        : report.status === 'rejected'
                                        ? 'The report has been rejected'
                                        : 'Awaiting further action'}
                                </p>
                                {report.resolution_notes && (
                                    <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                                        <strong>Resolution Notes:</strong> {report.resolution_notes}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    const ReporterInfoCard = () => (
        <Card>
            <CardHeader className="p-4">
                <CardTitle className="text-base flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Reporter Information
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                {report.is_anonymous ? (
                    <div className="text-center py-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Shield className="h-8 w-8 text-gray-400" />
                        </div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">Anonymous Report</h4>
                        <p className="text-sm text-gray-500 mt-1">Reporter's identity is protected</p>
                        <div className="mt-3 text-xs text-gray-500">
                            <p>Name: {report.reporter_name}</p>
                            {report.reporter_contact && <p>Contact: *******</p>}
                            {report.reporter_address && <p>Address: *******</p>}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Name</p>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{report.reporter_name}</p>
                        </div>
                        {report.reporter_contact && (
                            <div>
                                <p className="text-sm font-medium text-gray-500">Contact</p>
                                <p className="font-medium text-gray-900 dark:text-gray-100">{report.reporter_contact}</p>
                            </div>
                        )}
                        {report.reporter_address && (
                            <div>
                                <p className="text-sm font-medium text-gray-500">Address</p>
                                <p className="font-medium text-gray-900 dark:text-gray-100">{report.reporter_address}</p>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );

    const QuickActionsCard = () => (
        <Card>
            <CardHeader className="p-4">
                <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2">
                {report.canEdit && (
                    <Button 
                        variant="outline" 
                        className="w-full justify-start h-11"
                        asChild
                    >
                        <Link href={`/resident/community-reports/${report.id}/edit`}>
                            <FileText className="h-4 w-4 mr-2" />
                            Edit Report
                        </Link>
                    </Button>
                )}
                <Button variant="outline" className="w-full justify-start h-11" onClick={handlePrint}>
                    <Printer className="h-4 w-4 mr-2" />
                    Print Details
                </Button>
                <Button variant="outline" className="w-full justify-start h-11" onClick={handleShare}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                </Button>
                {report.canEdit && (
                    <Button 
                        variant="destructive" 
                        className="w-full justify-start h-11"
                        asChild
                    >
                        <Link 
                            href={`/resident/community-reports/${report.id}`} 
                            method="delete"
                            as="button"
                            type="button"
                            onClick={(e) => {
                                if (!confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
                                    e.preventDefault();
                                }
                            }}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Report
                        </Link>
                    </Button>
                )}
            </CardContent>
        </Card>
    );

    const HelpCard = () => (
        <Card>
            <CardHeader className="p-4">
                <CardTitle className="text-base flex items-center gap-2">
                    <HelpCircle className="h-5 w-5" />
                    Need Help?
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Phone className="h-5 w-5 text-gray-400" />
                        <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">Emergency Hotline</p>
                            <p className="text-sm text-gray-500">911</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Phone className="h-5 w-5 text-gray-400" />
                        <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">Barangay Hotline</p>
                            <p className="text-sm text-gray-500">(02) 123-4567</p>
                        </div>
                    </div>
                    <Button variant="outline" className="w-full" asChild>
                        <Link href="/resident/support">
                            Contact Support
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );

    // Alternative mobile navigation without Tabs component
    const MobileTabContent = () => {
        switch (activeTab) {
            case 'details':
                return (
                    <div className="space-y-4">
                        <ReportInfoCard />
                        <ReporterInfoCard />
                    </div>
                );
            case 'evidence':
                return <EvidenceCard />;
            case 'timeline':
                return (
                    <div className="space-y-4">
                        <TimelineCard />
                        {report.canEdit && <QuickActionsCard />}
                    </div>
                );
            case 'help':
                return <HelpCard />;
            default:
                return (
                    <div className="space-y-4">
                        <ReportInfoCard />
                        <ReporterInfoCard />
                    </div>
                );
        }
    };

    return (
        <ResidentLayout
            title={`Report #${report.report_number}`}
            breadcrumbs={[
                { title: 'Dashboard', href: '/resident/dashboard' },
                { title: 'My Reports', href: '/resident/community-reports' },
                { title: `#${report.report_number}`, href: `/resident/community-reports/${report.id}` }
            ]}
            showMobileHeader={true}
        >
            <div className="space-y-4 md:space-y-6 print:space-y-4">
                {/* Mobile Header */}
                <div className="flex items-center justify-between md:hidden">
                    <div className="flex items-center gap-2">
                        <Link href="/resident/community-reports">
                            <Button variant="ghost" size="icon" className="h-10 w-10">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="font-bold text-lg truncate max-w-[200px]">
                                #{report.report_number}
                            </h1>
                            <p className="text-xs text-gray-500 truncate max-w-[200px]">
                                {report.title}
                            </p>
                        </div>
                    </div>
                    <Sheet open={showActionsSheet} onOpenChange={setShowActionsSheet}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-10 w-10">
                                <MoreVertical className="h-5 w-5" />
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
                                        className="w-full justify-start"
                                        asChild
                                    >
                                        <Link href={`/resident/community-reports/${report.id}/edit`}>
                                            <FileText className="h-4 w-4 mr-2" />
                                            Edit Report
                                        </Link>
                                    </Button>
                                )}
                                <Button variant="outline" className="w-full justify-start" onClick={handlePrint}>
                                    <Printer className="h-4 w-4 mr-2" />
                                    Print
                                </Button>
                                <Button variant="outline" className="w-full justify-start" onClick={handleShare}>
                                    <Share2 className="h-4 w-4 mr-2" />
                                    Share
                                </Button>
                                <Link href="/resident/community-reports">
                                    <Button variant="outline" className="w-full justify-start">
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Back to Reports
                                    </Button>
                                </Link>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>

                {/* Desktop Header */}
                <div className="hidden md:flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/resident/community-reports">
                            <Button variant="ghost" size="sm" className="gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                Back to Reports
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                                Report #{report.report_number}
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                                Filed on {formatDateTime(report.created_at)}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
                            <Printer className="h-4 w-4" />
                            Print
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleShare} className="gap-2">
                            <Share2 className="h-4 w-4" />
                            Share
                        </Button>
                    </div>
                </div>

                {/* Status Banner */}
                <StatusBanner />

                <div className="grid gap-4 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Mobile Tab Navigation */}
                        {isMobile ? (
                            <div className="space-y-4">
                                {/* Custom Tab Navigation */}
                                <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 pt-2">
                                    <div className="grid grid-cols-4 gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                                        <button
                                            className={`py-2 px-1 rounded-md text-xs font-medium transition-colors ${
                                                activeTab === 'details'
                                                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                                            }`}
                                            onClick={() => setActiveTab('details')}
                                        >
                                            Details
                                        </button>
                                        <button
                                            className={`py-2 px-1 rounded-md text-xs font-medium transition-colors ${
                                                activeTab === 'evidence'
                                                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                                            }`}
                                            onClick={() => setActiveTab('evidence')}
                                        >
                                            Evidence
                                        </button>
                                        <button
                                            className={`py-2 px-1 rounded-md text-xs font-medium transition-colors ${
                                                activeTab === 'timeline'
                                                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                                            }`}
                                            onClick={() => setActiveTab('timeline')}
                                        >
                                            Timeline
                                        </button>
                                        <button
                                            className={`py-2 px-1 rounded-md text-xs font-medium transition-colors ${
                                                activeTab === 'help'
                                                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                                            }`}
                                            onClick={() => setActiveTab('help')}
                                        >
                                            Help
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Tab Content */}
                                <div className="mt-4">
                                    <MobileTabContent />
                                </div>
                            </div>
                        ) : (
                            /* Desktop Layout */
                            <div className="space-y-4">
                                <ReportInfoCard />
                                <EvidenceCard />
                                <TimelineCard />
                            </div>
                        )}
                    </div>

                    {/* Sidebar - Desktop Only */}
                    {!isMobile && (
                        <div className="space-y-4">
                            <ReporterInfoCard />
                            {report.canEdit && <QuickActionsCard />}
                            <HelpCard />
                        </div>
                    )}
                </div>

                {/* Mobile Bottom Actions */}
                {isMobile && report.canEdit && (
                    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4 z-40">
                        <div className="flex gap-3">
                            <Button 
                                className="flex-1" 
                                size="lg"
                                asChild
                            >
                                <Link href={`/resident/community-reports/${report.id}/edit`}>
                                    <FileText className="h-5 w-5 mr-2" />
                                    Edit
                                </Link>
                            </Button>
                            <Button 
                                variant="destructive" 
                                size="lg" 
                                className="flex-1"
                                asChild
                            >
                                <Link 
                                    href={`/resident/community-reports/${report.id}`} 
                                    method="delete"
                                    as="button"
                                    type="button"
                                    onClick={(e) => {
                                        if (!confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
                                            e.preventDefault();
                                        }
                                    }}
                                >
                                    <Trash2 className="h-5 w-5 mr-2" />
                                    Delete
                                </Link>
                            </Button>
                        </div>
                    </div>
                )}

                {/* Desktop Footer Actions */}
                {!isMobile && report.canEdit && (
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Link href={`/resident/community-reports/${report.id}/edit`}>
                            <Button className="gap-2">
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
                        a[href^="/resident/community-reports"]:not(.print-link) {
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