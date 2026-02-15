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
    Trash2
} from 'lucide-react';
import { Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface ComplaintEvidence {
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

interface ComplaintUser {
    id: number;
    name: string;
    email: string;
    phone: string;
    address: string;
}

interface Complaint {
    id: number;
    complaint_number: string;
    type: string;
    subject: string;
    description: string;
    location: string;
    incident_date: string;
    priority: 'low' | 'medium' | 'high';
    status: 'pending' | 'under_review' | 'resolved' | 'dismissed';
    is_anonymous: boolean;
    evidences: ComplaintEvidence[];
    admin_notes: string | null;
    resolved_at: string | null;
    created_at: string;
    updated_at: string;
    user: ComplaintUser;
    canEdit: boolean;
    complaintTypes: Record<string, string>;
}

interface Props {
    complaint: Complaint;
}

export default function ShowComplaint({ complaint }: Props) {
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
            case 'high': 
                return {
                    color: 'bg-red-100 text-red-800 border-red-200',
                    icon: AlertCircle,
                    text: 'Urgent attention required',
                    dot: 'bg-red-500'
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
            case 'resolved': 
                return {
                    color: 'bg-green-100 text-green-800 border-green-200',
                    icon: CheckCircle,
                    bgColor: 'bg-green-50',
                    description: 'Successfully resolved',
                    nextStep: 'Case closed'
                };
            case 'dismissed': 
                return {
                    color: 'bg-gray-100 text-gray-800 border-gray-200',
                    icon: XCircle,
                    bgColor: 'bg-gray-50',
                    description: 'Case dismissed',
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
            return format(new Date(dateString), 'MMM dd, yyyy · hh:mm a');
        } catch {
            return 'Invalid date';
        }
    };

    const getTypeIcon = (type: string) => {
        const typeMap: Record<string, any> = {
            'maintenance': Home,
            'noise': AlertCircle,
            'security': Shield,
            'neighbor': AlertTriangle,
            'parking': Navigation,
            'cleanliness': AlertCircle,
            'facility': Home,
            'safety': Shield,
            'other': AlertCircle
        };
        return typeMap[type] || AlertCircle;
    };

    const getFileIcon = (fileType: string, isImage: boolean) => {
        if (isImage) return Image;
        if (fileType.includes('pdf')) return FilePdf;
        if (fileType.includes('video')) return FileVideo;
        return FileText;
    };

    const handlePrint = () => {
        window.print();
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: `Complaint: ${complaint.subject}`,
                text: `Complaint #${complaint.complaint_number} - ${complaint.subject}`,
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

        if (!complaint.canEdit) {
            toast.error('You cannot delete evidence from a non-pending complaint');
            return;
        }

        setDeletingEvidence(evidenceId);
        
        router.delete(`/my-complaints/${complaint.id}/evidence/${evidenceId}`, {
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

    const downloadEvidence = (evidence: ComplaintEvidence) => {
        const link = document.createElement('a');
        link.href = evidence.file_url;
        link.download = evidence.file_name;
        link.click();
    };

    const StatusBanner = () => {
        const config = getStatusConfig(complaint.status);
        const Icon = config.icon;
        const borderColorClass = complaint.status === 'resolved' 
            ? 'border-l-green-500' 
            : complaint.status === 'pending' 
            ? 'border-l-yellow-500' 
            : 'border-l-blue-500';
        
        return (
            <Card className={`border-l-4 ${borderColorClass}`}>
                <CardContent className="p-4">
                    <div className="space-y-4">
                        {/* Status Header */}
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${config.bgColor}`}>
                                    <Icon className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Current Status</h3>
                                    <Badge className={`${config.color} gap-1`}>
                                        <Icon className="h-3 w-3" />
                                        {complaint.status.replace('_', ' ').toUpperCase()}
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
                                        <Badge className={`${getPriorityConfig(complaint.priority).color} gap-1 mt-1`}>
                                            <span className={`h-2 w-2 rounded-full ${getPriorityConfig(complaint.priority).dot}`}></span>
                                            {complaint.priority.toUpperCase()}
                                        </Badge>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Filed Date</p>
                                        <p className="font-medium">{formatDate(complaint.created_at)}</p>
                                    </div>
                                </div>
                                
                                {complaint.status === 'resolved' && complaint.resolved_at && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                            <span className="text-sm font-medium text-green-800">
                                                Resolved on {formatDate(complaint.resolved_at)}
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

    const ComplaintInfoCard = () => {
        const TypeIcon = getTypeIcon(complaint.type);
        const complaintTypeDisplay = complaint.complaintTypes?.[complaint.type] || complaint.type.replace('_', ' ');
        
        return (
            <Card>
                <CardHeader className="p-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <TypeIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <CardTitle className="text-base">{complaintTypeDisplay}</CardTitle>
                            <CardDescription className="text-sm">#{complaint.complaint_number}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-4">
                    {/* Subject */}
                    <div>
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-2">
                            {complaint.subject}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">
                            {complaint.description}
                        </p>
                    </div>

                    <Separator />

                    {/* Location and Date */}
                    <div className="space-y-3">
                        <div className="flex items-start gap-3">
                            <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-500">Location</p>
                                <p className="font-medium text-gray-900 dark:text-gray-100">{complaint.location}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-500">Incident Date</p>
                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                    {complaint.incident_date ? formatDate(complaint.incident_date) : 'Not specified'}
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    };

    const EvidenceCard = () => {
        if (!complaint.evidences || complaint.evidences.length === 0) {
            return (
                <Card>
                    <CardContent className="p-6 text-center">
                        <File className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">No Evidence Attached</h4>
                        <p className="text-sm text-gray-500">No supporting files were uploaded with this complaint</p>
                    </CardContent>
                </Card>
            );
        }

        return (
            <Card>
                <CardHeader className="p-4">
                    <CardTitle className="text-base">Supporting Evidence</CardTitle>
                    <CardDescription>
                        {complaint.evidences.length} file{complaint.evidences.length !== 1 ? 's' : ''} attached
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <div className="space-y-3">
                        {complaint.evidences.map((evidence) => {
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
                                            {complaint.canEdit && (
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
                    
                    {/* Add more evidence button if complaint is editable */}
                    {complaint.canEdit && (
                        <div className="mt-4 pt-3 border-t">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full"
                                asChild
                            >
                                <Link href={`/my-complaints/${complaint.id}/edit`}>
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
                    Complaint Timeline
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
                                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">Complaint Filed</h4>
                                    <span className="text-xs text-gray-500">{formatDate(complaint.created_at)}</span>
                                </div>
                                <p className="text-sm text-gray-600">Complaint was submitted successfully</p>
                            </div>
                        </div>

                        {/* Under Review */}
                        {complaint.status !== 'pending' && (
                            <div className="relative pl-10">
                                <div className="absolute left-4 top-1.5">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full ring-4 ring-blue-100"></div>
                                </div>
                                <div>
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">Under Review</h4>
                                        <span className="text-xs text-gray-500">{formatDate(complaint.updated_at)}</span>
                                    </div>
                                    <p className="text-sm text-gray-600">Complaint is being reviewed by officials</p>
                                </div>
                            </div>
                        )}

                        {/* Current Status */}
                        <div className="relative pl-10">
                            <div className="absolute left-4 top-1.5">
                                <div className={`w-3 h-3 rounded-full ring-4 ${
                                    complaint.status === 'resolved' ? 'bg-green-500 ring-green-100' :
                                    complaint.status === 'dismissed' ? 'bg-gray-500 ring-gray-100' :
                                    'bg-blue-500 ring-blue-100'
                                }`}></div>
                            </div>
                            <div>
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 capitalize">
                                        {complaint.status.replace('_', ' ')}
                                    </h4>
                                    {complaint.resolved_at && (
                                        <span className="text-xs text-gray-500">{formatDate(complaint.resolved_at)}</span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-600">
                                    {complaint.status === 'resolved' 
                                        ? 'The complaint has been resolved successfully'
                                        : complaint.status === 'dismissed'
                                        ? 'The complaint has been dismissed'
                                        : 'Awaiting further action'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    const AdminNotesCard = () => {
        if (!complaint.admin_notes) {
            return (
                <Card>
                    <CardContent className="p-6 text-center">
                        <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">No Admin Notes</h4>
                        <p className="text-sm text-gray-500">No notes have been added by officials yet</p>
                    </CardContent>
                </Card>
            );
        }

        return (
            <Card>
                <CardHeader className="p-4">
                    <CardTitle className="text-base flex items-center gap-2">
                        <MessageCircle className="h-5 w-5" />
                        Administrative Notes
                    </CardTitle>
                    <CardDescription>Notes from barangay officials</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-medium text-amber-800 mb-2">Official Notes</h4>
                                <p className="text-amber-700 whitespace-pre-line">
                                    {complaint.admin_notes}
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    };

    const UserInfoCard = () => (
        <Card>
            <CardHeader className="p-4">
                <CardTitle className="text-base flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Your Information
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                {complaint.is_anonymous ? (
                    <div className="text-center py-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Shield className="h-8 w-8 text-gray-400" />
                        </div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">Anonymous Complaint</h4>
                        <p className="text-sm text-gray-500 mt-1">Your identity is protected</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Name</p>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{complaint.user.name}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Email</p>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{complaint.user.email}</p>
                        </div>
                        {complaint.user.phone && (
                            <div>
                                <p className="text-sm font-medium text-gray-500">Phone</p>
                                <p className="font-medium text-gray-900 dark:text-gray-100">{complaint.user.phone}</p>
                            </div>
                        )}
                        <div>
                            <p className="text-sm font-medium text-gray-500">Address</p>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{complaint.user.address}</p>
                        </div>
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
                {complaint.canEdit && (
                    <Button 
                        variant="outline" 
                        className="w-full justify-start h-11"
                        asChild
                    >
                        <Link href={`/my-complaints/${complaint.id}/edit`}>
                            <FileText className="h-4 w-4 mr-2" />
                            Edit Complaint
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
                {complaint.canEdit && (
                    <Button 
                        variant="destructive" 
                        className="w-full justify-start h-11"
                        asChild
                    >
                        <Link 
                            href={`/my-complaints/${complaint.id}`} 
                            method="delete"
                            as="button"
                            type="button"
                            onClick={(e) => {
                                if (!confirm('Are you sure you want to delete this complaint? This action cannot be undone.')) {
                                    e.preventDefault();
                                }
                            }}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Complaint
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
                            <p className="font-medium text-gray-900 dark:text-gray-100">Call Support</p>
                            <p className="text-sm text-gray-500">(02) 123-4567</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Mail className="h-5 w-5 text-gray-400" />
                        <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">Email</p>
                            <p className="text-sm text-gray-500">complaints@barangay.gov.ph</p>
                        </div>
                    </div>
                    <Button variant="outline" className="w-full">
                        Contact Support
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
                        <ComplaintInfoCard />
                        <UserInfoCard />
                    </div>
                );
            case 'evidence':
                return <EvidenceCard />;
            case 'timeline':
                return (
                    <div className="space-y-4">
                        <TimelineCard />
                        {complaint.canEdit && <QuickActionsCard />}
                    </div>
                );
            case 'notes':
                return (
                    <div className="space-y-4">
                        <AdminNotesCard />
                        <HelpCard />
                    </div>
                );
            default:
                return (
                    <div className="space-y-4">
                        <ComplaintInfoCard />
                        <UserInfoCard />
                    </div>
                );
        }
    };

    return (
        <ResidentLayout
            title={`Complaint #${complaint.complaint_number}`}
            breadcrumbs={[
                { title: 'Dashboard', href: '/resident/dashboard' },
                { title: 'My Complaints', href: '/my-complaints' },
                { title: `#${complaint.complaint_number}`, href: `/my-complaints/${complaint.id}` }
            ]}
            showMobileHeader={true}
        >
            <div className="space-y-4 md:space-y-6 print:space-y-4">
                {/* Mobile Header */}
                <div className="flex items-center justify-between md:hidden">
                    <div className="flex items-center gap-2">
                        <Link href="/my-complaints">
                            <Button variant="ghost" size="icon" className="h-10 w-10">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="font-bold text-lg truncate max-w-[200px]">
                                #{complaint.complaint_number}
                            </h1>
                            <p className="text-xs text-gray-500 truncate max-w-[200px]">
                                {complaint.subject}
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
                                {complaint.canEdit && (
                                    <Button 
                                        variant="outline" 
                                        className="w-full justify-start"
                                        asChild
                                    >
                                        <Link href={`/my-complaints/${complaint.id}/edit`}>
                                            <FileText className="h-4 w-4 mr-2" />
                                            Edit Complaint
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
                                <Link href="/my-complaints">
                                    <Button variant="outline" className="w-full justify-start">
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Back to Complaints
                                    </Button>
                                </Link>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>

                {/* Desktop Header */}
                <div className="hidden md:flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/my-complaints">
                            <Button variant="ghost" size="sm" className="gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                Back to Complaints
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                                Complaint #{complaint.complaint_number}
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                                Filed on {formatDate(complaint.created_at)}
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
                                                activeTab === 'notes'
                                                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                                            }`}
                                            onClick={() => setActiveTab('notes')}
                                        >
                                            Notes
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
                                <ComplaintInfoCard />
                                <EvidenceCard />
                                <TimelineCard />
                                <AdminNotesCard />
                            </div>
                        )}
                    </div>

                    {/* Sidebar - Desktop Only */}
                    {!isMobile && (
                        <div className="space-y-4">
                            <UserInfoCard />
                            {complaint.canEdit && <QuickActionsCard />}
                            <HelpCard />
                        </div>
                    )}
                </div>

                {/* Mobile Bottom Actions */}
                {isMobile && (
                    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4 z-40">
                        <div className="flex gap-3">
                            {complaint.canEdit && (
                                <>
                                    <Button 
                                        className="flex-1" 
                                        size="lg"
                                        asChild
                                    >
                                        <Link href={`/my-complaints/${complaint.id}/edit`}>
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
                                            href={`/my-complaints/${complaint.id}`} 
                                            method="delete"
                                            as="button"
                                            type="button"
                                            onClick={(e) => {
                                                if (!confirm('Are you sure you want to delete this complaint? This action cannot be undone.')) {
                                                    e.preventDefault();
                                                }
                                            }}
                                        >
                                            <Trash2 className="h-5 w-5 mr-2" />
                                            Delete
                                        </Link>
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Desktop Footer Actions */}
                {!isMobile && complaint.canEdit && (
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Link href={`/my-complaints/${complaint.id}/edit`}>
                            <Button className="gap-2">
                                <FileText className="h-4 w-4" />
                                Edit Complaint
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
                        a[href^="/my-complaints"]:not(.print-link) {
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