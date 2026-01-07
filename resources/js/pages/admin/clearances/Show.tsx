// resources/js/Pages/Clearances/Show.tsx
import { useState } from 'react';
import { router } from '@inertiajs/react';
import AppLayout from '@/layouts/admin-app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    ArrowLeft,
    Download,
    Printer,
    FileText,
    CheckCircle,
    Clock,
    XCircle,
    AlertCircle,
    DollarSign,
    Calendar,
    User,
    FileCheck,
    MessageSquare,
    History,
    Edit, // Already imported
    Trash2,
    Copy,
    Mail,
    Phone,
    MapPin,
    CalendarDays,
    Shield,
    TrendingUp,
    FileSignature,
    Eye,
    FileCode,
    Tag
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import { ClearanceRequest, ActivityLog } from '@/types/clearance';

interface ShowClearanceProps {
    clearance: ClearanceRequest;
    activityLogs?: ActivityLog[];
    canEdit: boolean;
    canDelete: boolean;
    canProcess: boolean;
    canIssue: boolean;
    canApprove: boolean;
    canPrint: boolean;
}

export default function ShowClearance({
    clearance,
    activityLogs = [],
    canEdit = false,
    canDelete = false,
    canProcess = false,
    canIssue = false,
    canApprove = false,
    canPrint = false
}: ShowClearanceProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);
    const [activeTab, setActiveTab] = useState<'details' | 'documents' | 'payment' | 'history'>('details');

    // Format date
    const formatDate = (dateString?: string): string => {
        if (!dateString) return 'Not set';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Invalid date';
            return date.toLocaleDateString('en-PH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
            });
        } catch (error) {
            return 'Invalid date';
        }
    };

    const formatDateTime = (dateString?: string): string => {
        if (!dateString) return 'Not set';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Invalid date';
            return date.toLocaleDateString('en-PH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return 'Invalid date';
        }
    };

    // Get status badge variant
    const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" | "success" => {
        const variants: Record<string, "default" | "secondary" | "destructive" | "outline" | "success"> = {
            'pending': 'secondary',
            'pending_payment': 'outline',
            'processing': 'outline',
            'approved': 'success',
            'issued': 'default',
            'rejected': 'destructive',
            'cancelled': 'destructive',
            'expired': 'outline'
        };
        return variants[status] || 'outline';
    };

    // Get status icon
    const getStatusIcon = (status: string) => {
        const icons: Record<string, JSX.Element> = {
            'pending': <Clock className="h-4 w-4 text-amber-500" />,
            'pending_payment': <DollarSign className="h-4 w-4 text-amber-500" />,
            'processing': <FileCode className="h-4 w-4 text-blue-500" />,
            'approved': <CheckCircle className="h-4 w-4 text-green-500" />,
            'issued': <Shield className="h-4 w-4 text-green-500" />,
            'rejected': <XCircle className="h-4 w-4 text-red-500" />,
            'cancelled': <XCircle className="h-4 w-4 text-gray-500" />,
            'expired': <AlertCircle className="h-4 w-4 text-gray-500" />
        };
        return icons[status] || null;
    };

    // Get urgency badge variant
    const getUrgencyVariant = (urgency: string): "default" | "secondary" | "destructive" | "outline" => {
        const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
            'normal': 'default',
            'rush': 'secondary',
            'express': 'destructive'
        };
        return variants[urgency] || 'outline';
    };

    // Handle actions
    const handlePrint = () => {
        setIsPrinting(true);
        router.get(`/clearances/${clearance.id}/print`, {}, {
            onFinish: () => setIsPrinting(false)
        });
    };

    const handleDownload = () => {
        router.get(`/clearances/${clearance.id}/download`);
    };

    const handleMarkAsProcessing = () => {
        if (confirm('Mark this request as "Under Processing"?')) {
            setIsProcessing(true);
            router.post(`/clearances/${clearance.id}/process`, {}, {
                onSuccess: () => setIsProcessing(false),
                onError: () => setIsProcessing(false)
            });
        }
    };

    const handleApprove = () => {
        if (confirm('Approve this clearance request?')) {
            setIsProcessing(true);
            router.post(`/clearances/${clearance.id}/approve`, {}, {
                onSuccess: () => setIsProcessing(false),
                onError: () => setIsProcessing(false)
            });
        }
    };

    const handleIssue = () => {
        if (confirm('Issue this clearance certificate?')) {
            setIsProcessing(true);
            router.post(`/clearances/${clearance.id}/issue`, {}, {
                onSuccess: () => setIsProcessing(false),
                onError: () => setIsProcessing(false)
            });
        }
    };

    const handleReject = () => {
        const reason = prompt('Please enter the reason for rejection:');
        if (reason) {
            setIsProcessing(true);
            router.post(`/clearances/${clearance.id}/reject`, { reason }, {
                onSuccess: () => setIsProcessing(false),
                onError: () => setIsProcessing(false)
            });
        }
    };

    const handleCancel = () => {
        const reason = prompt('Please enter the reason for cancellation:');
        if (reason !== null) {
            setIsProcessing(true);
            router.post(`/clearances/${clearance.id}/cancel`, { reason }, {
                onSuccess: () => setIsProcessing(false),
                onError: () => setIsProcessing(false)
            });
        }
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this clearance request? This action cannot be undone.')) {
            router.delete(`/clearances/${clearance.id}`);
        }
    };

    const handleEdit = () => {
        // Navigate to edit page
        router.visit(`/clearances/${clearance.id}/edit`);
    };

    // Copy reference number to clipboard
    const copyReferenceNumber = () => {
        navigator.clipboard.writeText(clearance.reference_number);
        alert('Reference number copied to clipboard!');
    };

    // Calculate remaining validity
    const getValidityStatus = () => {
        if (clearance.status !== 'issued' || !clearance.valid_until) {
            return null;
        }

        const today = new Date();
        const validUntil = new Date(clearance.valid_until);
        const diffTime = validUntil.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 0) {
            return { text: `Valid for ${diffDays} day${diffDays !== 1 ? 's' : ''}`, color: 'text-green-600' };
        } else if (diffDays === 0) {
            return { text: 'Expires today', color: 'text-amber-600' };
        } else {
            return { text: `Expired ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} ago`, color: 'text-red-600' };
        }
    };

    const validityStatus = getValidityStatus();

    return (
        <AppLayout
            title={`Clearance Request: ${clearance.reference_number}`}
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Clearances', href: '/clearances' },
                { title: clearance.reference_number, href: `/clearances/${clearance.id}` }
            ]}
        >
            <div className="space-y-6">
                {/* Header with Actions - Added Edit button */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/clearances">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to List
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Clearance Request</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant={getStatusVariant(clearance.status)} className="flex items-center gap-1">
                                    {getStatusIcon(clearance.status)}
                                    {clearance.status_display || clearance.status}
                                </Badge>
                                <div className="flex items-center gap-2">
                                    <Tag className="h-3 w-3 text-gray-500" />
                                    <span className="text-sm text-gray-600 font-mono cursor-pointer hover:underline" 
                                          onClick={copyReferenceNumber} 
                                          title="Click to copy">
                                        {clearance.reference_number}
                                    </span>
                                </div>
                                {clearance.clearance_number && (
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-3 w-3 text-gray-500" />
                                        <span className="text-sm text-gray-600 font-mono">
                                            {clearance.clearance_number}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Always show Edit button for admin */}
                        <Button 
                            variant="outline"
                            onClick={handleEdit}
                        >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                        </Button>

                        {canPrint && clearance.status === 'issued' && (
                            <Button onClick={handlePrint} disabled={isPrinting}>
                                <Printer className="h-4 w-4 mr-2" />
                                {isPrinting ? 'Printing...' : 'Print Certificate'}
                            </Button>
                        )}
                        
                        {canDelete && ['pending', 'pending_payment', 'processing'].includes(clearance.status) && (
                            <Button variant="outline" onClick={handleDelete} className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </Button>
                        )}
                    </div>
                </div>

                {/* Status Banner */}
                {clearance.status === 'issued' && validityStatus && (
                    <Card className={`border-l-4 ${validityStatus.color.includes('green') ? 'border-l-green-500' : validityStatus.color.includes('amber') ? 'border-l-amber-500' : 'border-l-red-500'}`}>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Shield className={`h-5 w-5 ${validityStatus.color}`} />
                                    <div>
                                        <p className="font-medium">Clearance Status</p>
                                        <p className={`text-sm ${validityStatus.color}`}>
                                            {validityStatus.text} • Issued on {formatDate(clearance.issue_date)} • Valid until {formatDate(clearance.valid_until)}
                                        </p>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" onClick={handleDownload}>
                                    <Download className="h-4 w-4 mr-2" />
                                    Download Certificate
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Main Content */}
                <div className="grid gap-6 md:grid-cols-3">
                    {/* Left Column - Request Details with Tabs */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Tab Navigation */}
                        <div className="border-b border-gray-200">
                            <nav className="flex space-x-8">
                                <button
                                    onClick={() => setActiveTab('details')}
                                    className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'details' 
                                        ? 'border-blue-500 text-blue-600' 
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    Details
                                </button>
                                <button
                                    onClick={() => setActiveTab('documents')}
                                    className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'documents' 
                                        ? 'border-blue-500 text-blue-600' 
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    Documents
                                </button>
                                <button
                                    onClick={() => setActiveTab('payment')}
                                    className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'payment' 
                                        ? 'border-blue-500 text-blue-600' 
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    Payment
                                </button>
                                <button
                                    onClick={() => setActiveTab('history')}
                                    className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'history' 
                                        ? 'border-blue-500 text-blue-600' 
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    History
                                </button>
                            </nav>
                        </div>

                        {/* Tab Content */}
                        <div className="pt-2">
                            {/* Details Tab */}
                            {activeTab === 'details' && (
                                <div className="space-y-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <FileText className="h-5 w-5" />
                                                Request Information
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <p className="text-sm font-medium text-gray-500">Clearance Type</p>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className="text-sm">
                                                            {clearance.clearance_type?.name || 'N/A'}
                                                        </Badge>
                                                        <span className="text-xs text-gray-500">({clearance.clearance_type?.code})</span>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-sm font-medium text-gray-500">Purpose</p>
                                                    <p className="text-sm">{clearance.purpose}</p>
                                                    {clearance.specific_purpose && (
                                                        <p className="text-sm text-gray-500">{clearance.specific_purpose}</p>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-sm font-medium text-gray-500">Urgency</p>
                                                    <Badge variant={getUrgencyVariant(clearance.urgency)}>
                                                        {clearance.urgency_display || clearance.urgency}
                                                    </Badge>
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-sm font-medium text-gray-500">Fee Amount</p>
                                                    <p className="text-lg font-semibold">
                                                        {clearance.formatted_fee || `₱${clearance.fee_amount?.toFixed(2) || '0.00'}`}
                                                    </p>
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-sm font-medium text-gray-500">Requested Date</p>
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <Calendar className="h-3 w-3" />
                                                        {formatDate(clearance.created_at)}
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-sm font-medium text-gray-500">Needed By</p>
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <CalendarDays className="h-3 w-3" />
                                                        {clearance.needed_date ? formatDate(clearance.needed_date) : 'Not specified'}
                                                    </div>
                                                </div>
                                            </div>

                                            {clearance.additional_requirements && (
                                                <div className="space-y-2">
                                                    <p className="text-sm font-medium text-gray-500">Additional Requirements</p>
                                                    <p className="text-sm text-gray-600">{clearance.additional_requirements}</p>
                                                </div>
                                            )}

                                            {clearance.requirements_met && clearance.requirements_met.length > 0 && (
                                                <div className="space-y-2">
                                                    <p className="text-sm font-medium text-gray-500">Requirements Met</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {clearance.requirements_met.map((req: string, index: number) => (
                                                            <Badge key={index} variant="outline" className="flex items-center gap-1">
                                                                <FileCheck className="h-3 w-3" />
                                                                {req}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <User className="h-5 w-5" />
                                                Resident Information
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {clearance.resident ? (
                                                <div className="space-y-4">
                                                    <div className="flex items-start gap-4">
                                                        {clearance.resident.profile_photo ? (
                                                            <img
                                                                src={clearance.resident.profile_photo}
                                                                alt={clearance.resident.full_name}
                                                                className="h-16 w-16 rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                                                                <User className="h-8 w-8 text-gray-400" />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <h3 className="font-semibold text-lg">{clearance.resident.full_name}</h3>
                                                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                                                {clearance.resident.contact_number && (
                                                                    <span className="flex items-center gap-1">
                                                                        <Phone className="h-3 w-3" />
                                                                        {clearance.resident.contact_number}
                                                                    </span>
                                                                )}
                                                                {clearance.resident.email && (
                                                                    <span className="flex items-center gap-1">
                                                                        <Mail className="h-3 w-3" />
                                                                        {clearance.resident.email}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <Separator />

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <p className="text-sm font-medium text-gray-500">Address</p>
                                                            <p className="text-sm flex items-start gap-1">
                                                                <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                                                {clearance.resident.address || 'No address provided'}
                                                            </p>
                                                        </div>
                                                        {clearance.resident.birth_date && (
                                                            <div className="space-y-2">
                                                                <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                                                                <p className="text-sm">{formatDate(clearance.resident.birth_date)}</p>
                                                            </div>
                                                        )}
                                                        {clearance.resident.gender && (
                                                            <div className="space-y-2">
                                                                <p className="text-sm font-medium text-gray-500">Gender</p>
                                                                <p className="text-sm capitalize">{clearance.resident.gender}</p>
                                                            </div>
                                                        )}
                                                        {clearance.resident.civil_status && (
                                                            <div className="space-y-2">
                                                                <p className="text-sm font-medium text-gray-500">Civil Status</p>
                                                                <p className="text-sm capitalize">{clearance.resident.civil_status}</p>
                                                            </div>
                                                        )}
                                                        {clearance.resident.occupation && (
                                                            <div className="space-y-2">
                                                                <p className="text-sm font-medium text-gray-500">Occupation</p>
                                                                <p className="text-sm">{clearance.resident.occupation}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-gray-500">Resident information not available</p>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            {/* Documents Tab */}
                            {activeTab === 'documents' && (
                                <div>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <FileCheck className="h-5 w-5" />
                                                Submitted Documents
                                            </CardTitle>
                                            <CardDescription>
                                                Documents submitted by the resident for this clearance request
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            {clearance.documents && clearance.documents.length > 0 ? (
                                                <div className="space-y-3">
                                                    {clearance.documents.map((doc: any) => (
                                                        <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                                                            <div className="flex items-center gap-3">
                                                                <FileText className="h-5 w-5 text-blue-500" />
                                                                <div>
                                                                    <p className="font-medium">{doc.name}</p>
                                                                    <p className="text-xs text-gray-500">
                                                                        {doc.document_type} • Uploaded {formatDateTime(doc.uploaded_at)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Badge variant={doc.status === 'verified' ? 'default' : 'outline'}>
                                                                    {doc.status}
                                                                </Badge>
                                                                <Button variant="ghost" size="sm">
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-8">
                                                    <FileText className="h-12 w-12 mx-auto text-gray-400" />
                                                    <h3 className="mt-4 text-lg font-semibold">No documents submitted</h3>
                                                    <p className="text-gray-500 mt-1">
                                                        The resident has not uploaded any documents for this request.
                                                    </p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            {/* Payment Tab */}
                            {activeTab === 'payment' && (
                                <div>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <DollarSign className="h-5 w-5" />
                                                Payment Information
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {clearance.payment ? (
                                                <div className="space-y-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <p className="text-sm font-medium text-gray-500">Amount</p>
                                                            <p className="text-2xl font-bold">{clearance.payment.formatted_amount}</p>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <p className="text-sm font-medium text-gray-500">Status</p>
                                                            <Badge variant={clearance.payment.status === 'paid' ? 'default' : 'outline'}>
                                                                {clearance.payment.status.toUpperCase()}
                                                            </Badge>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <p className="text-sm font-medium text-gray-500">Payment Method</p>
                                                            <p className="text-sm capitalize">{clearance.payment.payment_method?.replace('_', ' ') || 'N/A'}</p>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <p className="text-sm font-medium text-gray-500">Reference Number</p>
                                                            <p className="text-sm font-mono">{clearance.payment.reference_number || 'N/A'}</p>
                                                        </div>
                                                        {clearance.payment.paid_at && (
                                                            <div className="space-y-2 md:col-span-2">
                                                                <p className="text-sm font-medium text-gray-500">Paid At</p>
                                                                <p className="text-sm">{formatDateTime(clearance.payment.paid_at)}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : clearance.status === 'pending_payment' ? (
                                                <div className="text-center py-8">
                                                    <DollarSign className="h-12 w-12 mx-auto text-gray-400" />
                                                    <h3 className="mt-4 text-lg font-semibold">Pending Payment</h3>
                                                    <p className="text-gray-500 mt-1">
                                                        Waiting for the resident to complete the payment.
                                                    </p>
                                                    <Button className="mt-4" onClick={() => router.post(`/clearances/${clearance.id}/verify-payment`)}>
                                                        Mark as Paid
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="text-center py-8">
                                                    <CheckCircle className="h-12 w-12 mx-auto text-gray-400" />
                                                    <h3 className="mt-4 text-lg font-semibold">No Payment Required</h3>
                                                    <p className="text-gray-500 mt-1">
                                                        This clearance type does not require payment.
                                                    </p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            {/* History Tab */}
                            {activeTab === 'history' && (
                                <div>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <History className="h-5 w-5" />
                                                Activity Log
                                            </CardTitle>
                                            <CardDescription>
                                                Timeline of all actions performed on this clearance request
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            {activityLogs.length > 0 ? (
                                                <div className="space-y-4">
                                                    {activityLogs.map((log: ActivityLog) => (
                                                        <div key={log.id} className="flex gap-3 pb-4 border-l-2 border-gray-200 last:border-l-0 last:pb-0">
                                                            <div className="flex-shrink-0 w-6 h-6 -ml-3 mt-0.5 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                                                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex items-center justify-between">
                                                                    <p className="font-medium">{log.user?.name || 'System'}</p>
                                                                    <p className="text-xs text-gray-500">{formatDateTime(log.created_at)}</p>
                                                                </div>
                                                                <p className="text-sm text-gray-600 mt-1">{log.description}</p>
                                                                {log.event && (
                                                                    <Badge variant="outline" className="mt-2">
                                                                        {log.event}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-8">
                                                    <History className="h-12 w-12 mx-auto text-gray-400" />
                                                    <h3 className="mt-4 text-lg font-semibold">No activity yet</h3>
                                                    <p className="text-gray-500 mt-1">
                                                        No actions have been performed on this request yet.
                                                    </p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Status & Actions */}
                    <div className="space-y-6">
                        {/* Status Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5" />
                                    Status Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-500">Current Status</p>
                                    <Badge variant={getStatusVariant(clearance.status)} className="flex items-center gap-1 w-fit">
                                        {getStatusIcon(clearance.status)}
                                        {clearance.status_display || clearance.status}
                                    </Badge>
                                </div>

                                {clearance.estimated_completion_date && (
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-500">Estimated Completion</p>
                                        <p className="text-sm">{formatDate(clearance.estimated_completion_date)}</p>
                                    </div>
                                )}

                                {clearance.issuing_officer_name && (
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-500">Issuing Officer</p>
                                        <p className="text-sm">{clearance.issuing_officer_name}</p>
                                    </div>
                                )}

                                {clearance.processed_at && (
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-500">Processed At</p>
                                        <p className="text-sm">{formatDateTime(clearance.processed_at)}</p>
                                    </div>
                                )}

                                {clearance.remarks && (
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-500">Officer Remarks</p>
                                        <p className="text-sm text-gray-600">{clearance.remarks}</p>
                                    </div>
                                )}

                                {clearance.admin_notes && (
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-500">Admin Notes</p>
                                        <p className="text-sm text-gray-600">{clearance.admin_notes}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Actions Panel */}
                        {canProcess && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileSignature className="h-5 w-5" />
                                        Actions
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {clearance.status === 'pending' && (
                                        <Button 
                                            className="w-full justify-start" 
                                            onClick={handleMarkAsProcessing}
                                            disabled={isProcessing}
                                        >
                                            <FileCode className="h-4 w-4 mr-2" />
                                            Mark as Processing
                                        </Button>
                                    )}

                                    {clearance.status === 'processing' && canApprove && (
                                        <Button 
                                            className="w-full justify-start" 
                                            onClick={handleApprove}
                                            disabled={isProcessing}
                                        >
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Approve Request
                                        </Button>
                                    )}

                                    {clearance.status === 'approved' && canIssue && (
                                        <Button 
                                            className="w-full justify-start" 
                                            onClick={handleIssue}
                                            disabled={isProcessing}
                                        >
                                            <Shield className="h-4 w-4 mr-2" />
                                            Issue Certificate
                                        </Button>
                                    )}

                                    {['pending', 'processing'].includes(clearance.status) && (
                                        <Button 
                                            variant="outline" 
                                            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                                            onClick={handleReject}
                                            disabled={isProcessing}
                                        >
                                            <XCircle className="h-4 w-4 mr-2" />
                                            Reject Request
                                        </Button>
                                    )}

                                    {['pending', 'pending_payment', 'processing'].includes(clearance.status) && (
                                        <Button 
                                            variant="outline" 
                                            className="w-full justify-start text-gray-600 hover:text-gray-700"
                                            onClick={handleCancel}
                                            disabled={isProcessing}
                                        >
                                            <XCircle className="h-4 w-4 mr-2" />
                                            Cancel Request
                                        </Button>
                                    )}

                                    <Separator />

                                    <Button variant="ghost" className="w-full justify-start">
                                        <MessageSquare className="h-4 w-4 mr-2" />
                                        Add Note
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        {/* Quick Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-medium">Quick Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Created</span>
                                    <span>{formatDate(clearance.created_at)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Last Updated</span>
                                    <span>{formatDate(clearance.updated_at)}</span>
                                </div>
                                {clearance.issue_date && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Issued Date</span>
                                        <span>{formatDate(clearance.issue_date)}</span>
                                    </div>
                                )}
                                {clearance.valid_until && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Valid Until</span>
                                        <span>{formatDate(clearance.valid_until)}</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}