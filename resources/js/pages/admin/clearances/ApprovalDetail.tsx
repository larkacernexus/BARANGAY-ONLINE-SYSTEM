import AppLayout from '@/layouts/admin-app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
    Shield,
    Clock,
    AlertTriangle,
    CheckCircle,
    XCircle,
    User,
    MapPin,
    Phone,
    Calendar,
    DollarSign,
    FileText,
    Download,
    Printer,
    Mail,
    ArrowLeft,
    Loader2,
    Building,
    IdCard,
    Check,
    X,
    MessageSquare,
    ExternalLink,
    Eye,
    Image,
    File,
    ZoomIn,
    ZoomOut,
    RotateCw,
    Maximize2,
    Minimize2
} from 'lucide-react';
import { Link, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { format, isValid, parseISO } from 'date-fns';
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
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

interface Resident {
    id: number;
    full_name: string;
    address: string;
    contact_number: string;
    email?: string;
    birth_date?: string;
    gender?: string;
    civil_status?: string;
    household?: any;
}

interface ClearanceType {
    id: number;
    name: string;
    description?: string;
    standard_fee: number;
    processing_days: number;
}

interface Document {
    id: number;
    file_name: string;
    file_path: string;
    file_url: string; // Added file_url
    file_size: number;
    uploaded_at: string;
    document_type: string;
    mime_type?: string;
}

interface ClearanceRequest {
    id: number;
    reference_number: string;
    purpose: string;
    urgency: string;
    needed_date: string;
    fee_amount: number;
    status: string;
    remarks?: string;
    rejection_reason?: string;
    created_at: string;
    updated_at: string;
    processed_at?: string;
    approved_at?: string;
    processor_id?: number;
    resident: Resident;
    clearanceType: ClearanceType;
    documents: Document[];
}

interface PageProps {
    request: ClearanceRequest;
    resident: Resident;
    clearanceType: ClearanceType;
    canApprove: boolean;
    canReject: boolean;
    canReturn: boolean;
}

// Helper function to safely format dates
const safeFormat = (dateString?: string, formatString: string = 'MMM dd, yyyy'): string => {
    if (!dateString) return 'Not specified';
    
    try {
        const date = parseISO(dateString);
        if (!isValid(date)) {
            return 'Invalid date';
        }
        return format(date, formatString);
    } catch (error) {
        console.error('Date formatting error:', error);
        return 'Invalid date';
    }
};

// Helper function to safely parse date
const safeParseDate = (dateString?: string): Date | null => {
    if (!dateString) return null;
    
    try {
        const date = parseISO(dateString);
        if (isValid(date)) {
            return date;
        }
        return null;
    } catch (error) {
        return null;
    }
};

// Helper function to get file icon based on type
const getFileIcon = (fileName: string, mimeType?: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (mimeType?.includes('image')) {
        return <Image className="h-8 w-8 text-blue-500" />;
    }
    
    if (mimeType?.includes('pdf') || extension === 'pdf') {
        return <FileText className="h-8 w-8 text-red-500" />;
    }
    
    switch (extension) {
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
        case 'bmp':
        case 'svg':
            return <Image className="h-8 w-8 text-blue-500" />;
        case 'doc':
        case 'docx':
            return <FileText className="h-8 w-8 text-blue-600" />;
        case 'xls':
        case 'xlsx':
            return <FileText className="h-8 w-8 text-green-600" />;
        default:
            return <File className="h-8 w-8 text-gray-500" />;
    }
};

// Helper function to get readable file size
const getReadableFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Helper function to get file URL (fallback for older data)
const getFileUrl = (document: Document): string => {
    // Use file_url if available (from backend)
    if (document.file_url) {
        return document.file_url;
    }
    
    // Fallback: construct URL from file_path
    // Remove 'public/' prefix if it exists
    const cleanPath = document.file_path.replace(/^public\//, '');
    return `/storage/${cleanPath}`;
};

export default function ApprovalDetails() {
    const { props } = usePage<PageProps>();
    const { 
        request, 
        resident, 
        clearanceType, 
        canApprove, 
        canReject, 
        canReturn 
    } = props;

    // Safety check
    if (!request) {
        return (
            <AppLayout
                title="Approval Details"
                breadcrumbs={[
                    { title: 'Dashboard', href: '/dashboard' },
                    { title: 'Clearances', href: '/clearances' },
                    { title: 'Approval Queue', href: '/clearances/approval' },
                    { title: 'Details', href: '#' }
                ]}
            >
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Request Not Found</h3>
                        <p className="text-gray-500">The clearance request could not be loaded.</p>
                        <Button asChild className="mt-4">
                            <Link href="/clearances/approval">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Queue
                            </Link>
                        </Button>
                    </div>
                </div>
            </AppLayout>
        );
    }

    const [approvalRemarks, setApprovalRemarks] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [showApproveDialog, setShowApproveDialog] = useState(false);
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [showReturnDialog, setShowReturnDialog] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
    const [showDocumentModal, setShowDocumentModal] = useState(false);
    const [imageScale, setImageScale] = useState(1);
    const [imageRotation, setImageRotation] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const handleApprove = () => {
        setIsProcessing(true);
        router.post(route('admin.clearances.approval.approve', request.id), {
            remarks: approvalRemarks,
        }, {
            onFinish: () => {
                setIsProcessing(false);
                setShowApproveDialog(false);
                setApprovalRemarks('');
            },
        });
    };

    const handleReject = () => {
        setIsProcessing(true);
        router.post(route('admin.clearances.approval.reject', request.id), {
            reason: rejectionReason,
        }, {
            onFinish: () => {
                setIsProcessing(false);
                setShowRejectDialog(false);
                setRejectionReason('');
            },
        });
    };

    const handleReturnToPending = () => {
        setIsProcessing(true);
        router.post(route('admin.clearances.approval.return-pending', request.id), {}, {
            onFinish: () => setIsProcessing(false),
        });
    };

    const handleMarkProcessing = () => {
        setIsProcessing(true);
        router.post(route('admin.clearances.approval.mark-processing', request.id), {}, {
            onFinish: () => setIsProcessing(false),
        });
    };

    const handleViewDocument = (document: Document) => {
        setSelectedDocument(document);
        setImageScale(1);
        setImageRotation(0);
        setShowDocumentModal(true);
    };

    const handleZoomIn = () => {
        setImageScale(prev => Math.min(prev + 0.25, 3));
    };

    const handleZoomOut = () => {
        setImageScale(prev => Math.max(prev - 0.25, 0.5));
    };

    const handleRotate = () => {
        setImageRotation(prev => (prev + 90) % 360);
    };

    const handleReset = () => {
        setImageScale(1);
        setImageRotation(0);
    };

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    const getUrgencyBadge = (urgency: string) => {
        switch (urgency) {
            case 'express':
                return {
                    variant: 'destructive' as const,
                    icon: <AlertTriangle className="h-3 w-3 mr-1" />,
                    label: 'Express',
                    description: 'Needs immediate attention'
                };
            case 'rush':
                return {
                    variant: 'warning' as const,
                    icon: <Clock className="h-3 w-3 mr-1" />,
                    label: 'Rush',
                    description: 'High priority'
                };
            default:
                return {
                    variant: 'secondary' as const,
                    icon: null,
                    label: 'Normal',
                    description: 'Standard processing'
                };
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return {
                    variant: 'success' as const,
                    icon: <CheckCircle className="h-3 w-3 mr-1" />,
                    label: 'Approved'
                };
            case 'rejected':
                return {
                    variant: 'destructive' as const,
                    icon: <XCircle className="h-3 w-3 mr-1" />,
                    label: 'Rejected'
                };
            case 'processing':
                return {
                    variant: 'warning' as const,
                    icon: <Loader2 className="h-3 w-3 mr-1 animate-spin" />,
                    label: 'Processing'
                };
            default:
                return {
                    variant: 'secondary' as const,
                    icon: <Clock className="h-3 w-3 mr-1" />,
                    label: 'Pending'
                };
        }
    };

    const urgency = getUrgencyBadge(request.urgency);
    const status = getStatusBadge(request.status);

    // Calculate days remaining until needed date
    const getDaysRemaining = (): number | null => {
        const neededDate = safeParseDate(request.needed_date);
        if (!neededDate) return null;

        const today = new Date();
        const diffTime = neededDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const daysRemaining = getDaysRemaining();

    // Calculate request age
    const getRequestAge = (): number => {
        const createdDate = safeParseDate(request.created_at);
        if (!createdDate) return 0;

        const today = new Date();
        const diffTime = today.getTime() - createdDate.getTime();
        return Math.floor(diffTime / (1000 * 3600 * 24));
    };

    const requestAge = getRequestAge();

    // Check if file is an image
    const isImageFile = (document: Document): boolean => {
        const mime = document.mime_type?.toLowerCase() || '';
        const extension = document.file_name.split('.').pop()?.toLowerCase() || '';
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'];
        
        return mime.includes('image') || imageExtensions.includes(extension);
    };

    // Check if file is PDF
    const isPdfFile = (document: Document): boolean => {
        const mime = document.mime_type?.toLowerCase() || '';
        const extension = document.file_name.split('.').pop()?.toLowerCase() || '';
        
        return mime.includes('pdf') || extension === 'pdf';
    };

    // Check if file is viewable inline
    const isViewableFile = (document: Document): boolean => {
        return isImageFile(document) || isPdfFile(document);
    };

    return (
        <AppLayout
            title={`Approval - ${request.reference_number}`}
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Clearances', href: '/clearances' },
                { title: 'Approval Queue', href: '/clearances/approval' },
                { title: request.reference_number, href: '#' }
            ]}
        >
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('admin.clearances.approval.index')}>
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Queue
                            </Button>
                        </Link>
                        <div className="flex items-center gap-2">
                            <Shield className="h-8 w-8 text-blue-600" />
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">
                                    Clearance Request: {request.reference_number}
                                </h1>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Review and process this clearance request
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                            <Printer className="h-4 w-4 mr-2" />
                            Print
                        </Button>
                        <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                    </div>
                </div>

                {/* Status Banner */}
                <div className={`p-4 rounded-lg border ${
                    request.status === 'approved' ? 'bg-green-50 border-green-200' :
                    request.status === 'rejected' ? 'bg-red-50 border-red-200' :
                    request.status === 'processing' ? 'bg-amber-50 border-amber-200' :
                    'bg-blue-50 border-blue-200'
                }`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Badge variant={status.variant} className="text-sm">
                                {status.icon}
                                {status.label}
                            </Badge>
                            {request.status === 'approved' && request.approved_at && (
                                <span className="text-sm text-gray-600">
                                    Approved on {safeFormat(request.approved_at, 'MMM dd, yyyy HH:mm')}
                                </span>
                            )}
                            {request.status === 'rejected' && request.processed_at && (
                                <span className="text-sm text-gray-600">
                                    Rejected on {safeFormat(request.processed_at, 'MMM dd, yyyy HH:mm')}
                                </span>
                            )}
                            {request.status === 'processing' && request.processed_at && (
                                <span className="text-sm text-gray-600">
                                    Started processing on {safeFormat(request.processed_at, 'MMM dd, yyyy HH:mm')}
                                </span>
                            )}
                        </div>
                        {daysRemaining !== null && daysRemaining <= 2 && (
                            <div className="flex items-center gap-2 text-amber-700">
                                <AlertTriangle className="h-4 w-4" />
                                <span className="text-sm font-medium">
                                    {daysRemaining <= 0 ? 'OVERDUE' : `${daysRemaining} day(s) remaining`}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left Column - Request Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Request Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Request Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm text-gray-500">Reference Number</Label>
                                        <p className="font-medium">{request.reference_number}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm text-gray-500">Clearance Type</Label>
                                        <Badge variant="outline">
                                            {clearanceType?.name || 'Unknown'}
                                        </Badge>
                                    </div>
                                    <div>
                                        <Label className="text-sm text-gray-500">Purpose</Label>
                                        <p className="font-medium">{request.purpose}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm text-gray-500">Urgency</Label>
                                        <Badge variant={urgency.variant}>
                                            {urgency.icon}
                                            {urgency.label}
                                        </Badge>
                                        <p className="text-xs text-gray-500 mt-1">{urgency.description}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm text-gray-500">Date Needed</Label>
                                        <p className="font-medium">
                                            {safeFormat(request.needed_date, 'MMMM dd, yyyy')}
                                        </p>
                                    </div>
                                    <div>
                                        <Label className="text-sm text-gray-500">Fee Amount</Label>
                                        <p className="font-medium text-lg">
                                            ₱{parseFloat(request.fee_amount?.toString() || '0').toFixed(2)}
                                        </p>
                                    </div>
                                </div>

                                {request.remarks && (
                                    <div>
                                        <Label className="text-sm text-gray-500">Additional Remarks</Label>
                                        <p className="mt-1 text-sm bg-gray-50 p-3 rounded-lg">
                                            {request.remarks}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Applicant Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Applicant Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm text-gray-500">Full Name</Label>
                                        <p className="font-medium">{resident?.full_name || 'Unknown'}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm text-gray-500">Contact Number</Label>
                                        <p className="font-medium">{resident?.contact_number || 'Not provided'}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <Label className="text-sm text-gray-500">Address</Label>
                                        <p className="font-medium">{resident?.address || 'Not provided'}</p>
                                    </div>
                                    {resident?.email && (
                                        <div>
                                            <Label className="text-sm text-gray-500">Email</Label>
                                            <p className="font-medium">{resident.email}</p>
                                        </div>
                                    )}
                                    {resident?.birth_date && (
                                        <div>
                                            <Label className="text-sm text-gray-500">Birth Date</Label>
                                            <p className="font-medium">
                                                {safeFormat(resident.birth_date, 'MMMM dd, yyyy')}
                                            </p>
                                        </div>
                                    )}
                                    {resident?.household && (
                                        <div className="col-span-2">
                                            <Label className="text-sm text-gray-500">Household Information</Label>
                                            <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                                                <p className="text-sm">
                                                    <span className="font-medium">Household No:</span> {resident.household.household_number}
                                                </p>
                                                <p className="text-sm mt-1">
                                                    <span className="font-medium">Address:</span> {resident.household.address}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Attached Documents */}
                        {request.documents && request.documents.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Attached Documents
                                    </CardTitle>
                                    <CardDescription>
                                        Documents submitted by the applicant
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {request.documents.map((document) => (
                                            <div 
                                                key={document.id}
                                                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                                            >
                                                <div className="flex items-center gap-3">
                                                    {getFileIcon(document.file_name, document.mime_type)}
                                                    <div>
                                                        <p className="font-medium">{document.file_name}</p>
                                                        <p className="text-xs text-gray-500">
                                                            {document.document_type || 'Document'} • 
                                                            {getReadableFileSize(document.file_size)} • 
                                                            {safeFormat(document.uploaded_at, 'MMM dd, yyyy')}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {isViewableFile(document) && (
                                                        <Button 
                                                            variant="ghost" 
                                                            size="sm"
                                                            onClick={() => handleViewDocument(document)}
                                                        >
                                                            <Eye className="h-4 w-4 mr-1" />
                                                            View
                                                        </Button>
                                                    )}
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        asChild
                                                    >
                                                        <a 
                                                            href={getFileUrl(document)} 
                                                            download={document.file_name}
                                                        >
                                                            <Download className="h-4 w-4" />
                                                        </a>
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column - Actions & Timeline */}
                    <div className="space-y-6">
                        {/* Approval Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Actions</CardTitle>
                                <CardDescription>
                                    Process this clearance request
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {request.status === 'pending' && (
                                    <>
                                        <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
                                            <AlertDialogTrigger asChild>
                                                <Button 
                                                    className="w-full" 
                                                    disabled={!canApprove || isProcessing}
                                                >
                                                    <Check className="h-4 w-4 mr-2" />
                                                    Approve Request
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Approve Clearance Request</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Are you sure you want to approve this clearance request?
                                                        This will generate the clearance document and notify the applicant.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <div className="space-y-4">
                                                    <div>
                                                        <Label htmlFor="approvalRemarks">Approval Remarks (Optional)</Label>
                                                        <Textarea
                                                            id="approvalRemarks"
                                                            placeholder="Add any notes or instructions..."
                                                            value={approvalRemarks}
                                                            onChange={(e) => setApprovalRemarks(e.target.value)}
                                                            rows={3}
                                                        />
                                                    </div>
                                                </div>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <Button onClick={handleApprove} disabled={isProcessing}>
                                                        {isProcessing ? (
                                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                        ) : (
                                                            <Check className="h-4 w-4 mr-2" />
                                                        )}
                                                        Yes, Approve
                                                    </Button>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>

                                        {canApprove && (
                                            <Button 
                                                className="w-full" 
                                                variant="outline"
                                                onClick={handleMarkProcessing}
                                                disabled={isProcessing}
                                            >
                                                <Clock className="h-4 w-4 mr-2" />
                                                Mark as Processing
                                            </Button>
                                        )}

                                        <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                                            <AlertDialogTrigger asChild>
                                                <Button 
                                                    className="w-full" 
                                                    variant="destructive"
                                                    disabled={!canReject || isProcessing}
                                                >
                                                    <X className="h-4 w-4 mr-2" />
                                                    Reject Request
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Reject Clearance Request</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Are you sure you want to reject this clearance request?
                                                        This action cannot be undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <div className="space-y-4">
                                                    <div>
                                                        <Label htmlFor="rejectionReason">Reason for Rejection *</Label>
                                                        <Textarea
                                                            id="rejectionReason"
                                                            placeholder="Please specify the reason for rejection..."
                                                            value={rejectionReason}
                                                            onChange={(e) => setRejectionReason(e.target.value)}
                                                            rows={4}
                                                            required
                                                        />
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            This reason will be shown to the applicant.
                                                        </p>
                                                    </div>
                                                </div>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <Button 
                                                        onClick={handleReject} 
                                                        variant="destructive"
                                                        disabled={!rejectionReason.trim() || isProcessing}
                                                    >
                                                        {isProcessing ? (
                                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                        ) : (
                                                            <X className="h-4 w-4 mr-2" />
                                                        )}
                                                        Confirm Rejection
                                                    </Button>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </>
                                )}

                                {request.status === 'processing' && (
                                    <>
                                        <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
                                            <AlertDialogTrigger asChild>
                                                <Button 
                                                    className="w-full" 
                                                    disabled={!canApprove || isProcessing}
                                                >
                                                    <Check className="h-4 w-4 mr-2" />
                                                    Approve & Issue
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Approve and Issue Clearance</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Issue the clearance document and notify the applicant.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <div className="space-y-4">
                                                    <div>
                                                        <Label htmlFor="approvalRemarks">Issuance Remarks (Optional)</Label>
                                                        <Textarea
                                                            id="approvalRemarks"
                                                            placeholder="Add any notes or instructions..."
                                                            value={approvalRemarks}
                                                            onChange={(e) => setApprovalRemarks(e.target.value)}
                                                            rows={3}
                                                        />
                                                    </div>
                                                </div>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <Button onClick={handleApprove} disabled={isProcessing}>
                                                        {isProcessing ? (
                                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                        ) : (
                                                            <Check className="h-4 w-4 mr-2" />
                                                        )}
                                                        Issue Clearance
                                                    </Button>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>

                                        {canReturn && (
                                            <Button 
                                                className="w-full" 
                                                variant="outline"
                                                onClick={handleReturnToPending}
                                                disabled={isProcessing}
                                            >
                                                <Clock className="h-4 w-4 mr-2" />
                                                Return to Pending
                                            </Button>
                                        )}
                                    </>
                                )}

                                {request.status === 'approved' && (
                                    <div className="space-y-3">
                                        <Button className="w-full" asChild>
                                            <a href={`/clearances/${request.id}/print`} target="_blank">
                                                <Printer className="h-4 w-4 mr-2" />
                                                Print Clearance
                                            </a>
                                        </Button>
                                        <Button className="w-full" variant="outline" asChild>
                                            <a href={`/clearances/${request.id}/download`}>
                                                <Download className="h-4 w-4 mr-2" />
                                                Download PDF
                                            </a>
                                        </Button>
                                        <Button className="w-full" variant="outline">
                                            <Mail className="h-4 w-4 mr-2" />
                                            Send to Email
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Quick Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Info</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-500">Standard Processing:</span>
                                    <span className="font-medium">{clearanceType?.processing_days || 3} days</span>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-500">Request Age:</span>
                                    <span className="font-medium">{requestAge} days</span>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-500">Documents Attached:</span>
                                    <span className="font-medium">{request.documents?.length || 0}</span>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-500">Last Updated:</span>
                                    <span className="font-medium text-xs">
                                        {safeFormat(request.updated_at, 'MMM dd, HH:mm')}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Document Viewing Modal */}
            <Dialog open={showDocumentModal} onOpenChange={setShowDocumentModal}>
                <DialogContent className={`${isFullscreen ? 'max-w-full w-full h-full' : 'max-w-4xl'} ${isFullscreen ? 'p-0' : ''}`}>
                    {selectedDocument && (
                        <>
                            <DialogHeader className={isFullscreen ? 'p-6 border-b' : ''}>
                                <DialogTitle className="flex items-center gap-2">
                                    {getFileIcon(selectedDocument.file_name, selectedDocument.mime_type)}
                                    {selectedDocument.file_name}
                                </DialogTitle>
                                <DialogDescription>
                                    {selectedDocument.document_type || 'Document'} • 
                                    {getReadableFileSize(selectedDocument.file_size)} • 
                                    Uploaded on {safeFormat(selectedDocument.uploaded_at, 'MMM dd, yyyy HH:mm')}
                                </DialogDescription>
                            </DialogHeader>
                            
                            <div className={isFullscreen ? 'flex-1 overflow-auto p-4' : ''}>
                                {isImageFile(selectedDocument) ? (
                                    <div className="space-y-4">
                                        <div className={`relative overflow-hidden ${isFullscreen ? 'min-h-[60vh]' : 'max-h-[60vh]'}`}>
                                            <div className="flex items-center justify-center">
                                                <img 
                                                    src={getFileUrl(selectedDocument)}
                                                    alt={selectedDocument.file_name}
                                                    className="max-w-full max-h-full object-contain"
                                                    style={{
                                                        transform: `scale(${imageScale}) rotate(${imageRotation}deg)`,
                                                        transition: 'transform 0.2s ease-in-out'
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    onClick={handleZoomOut}
                                                    disabled={imageScale <= 0.5}
                                                >
                                                    <ZoomOut className="h-4 w-4" />
                                                </Button>
                                                <span className="text-sm">{Math.round(imageScale * 100)}%</span>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    onClick={handleZoomIn}
                                                    disabled={imageScale >= 3}
                                                >
                                                    <ZoomIn className="h-4 w-4" />
                                                </Button>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    onClick={handleRotate}
                                                >
                                                    <RotateCw className="h-4 w-4" />
                                                </Button>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    onClick={handleReset}
                                                >
                                                    Reset
                                                </Button>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button 
                                                    variant="outline" 
                                                    size="sm"
                                                    onClick={toggleFullscreen}
                                                >
                                                    {isFullscreen ? (
                                                        <Minimize2 className="h-4 w-4" />
                                                    ) : (
                                                        <Maximize2 className="h-4 w-4" />
                                                    )}
                                                </Button>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    asChild
                                                >
                                                    <a 
                                                        href={getFileUrl(selectedDocument)} 
                                                        download={selectedDocument.file_name}
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </a>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ) : isPdfFile(selectedDocument) ? (
                                    <div className="space-y-4">
                                        <div className={`relative ${isFullscreen ? 'h-[70vh]' : 'h-[60vh]'}`}>
                                            <iframe 
                                                src={getFileUrl(selectedDocument)}
                                                title={selectedDocument.file_name}
                                                className="w-full h-full border rounded-lg"
                                                frameBorder="0"
                                            />
                                        </div>
                                        <div className="flex items-center justify-end">
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                onClick={toggleFullscreen}
                                                className="mr-2"
                                            >
                                                {isFullscreen ? (
                                                    <Minimize2 className="h-4 w-4" />
                                                ) : (
                                                    <Maximize2 className="h-4 w-4" />
                                                )}
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                asChild
                                            >
                                                <a 
                                                    href={getFileUrl(selectedDocument)} 
                                                    download={selectedDocument.file_name}
                                                >
                                                    <Download className="h-4 w-4" />
                                                </a>
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <File className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold mb-2">File Preview Not Available</h3>
                                        <p className="text-gray-500 mb-4">
                                            This file type cannot be previewed inline. Please download to view.
                                        </p>
                                        <div className="flex items-center justify-center gap-2">
                                            <Button asChild>
                                                <a 
                                                    href={getFileUrl(selectedDocument)} 
                                                    download={selectedDocument.file_name}
                                                >
                                                    <Download className="h-4 w-4 mr-2" />
                                                    Download File
                                                </a>
                                            </Button>
                                            <Button variant="outline" onClick={() => setShowDocumentModal(false)}>
                                                Close
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            {!isFullscreen && (
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setShowDocumentModal(false)}>
                                        Close
                                    </Button>
                                </DialogFooter>
                            )}
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}