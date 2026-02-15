import React, { useState, useEffect } from 'react';
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
    Image as ImageIcon,
    FileVideo,
    Trash2,
    Gavel,
    Scale,
    Loader2,
    Copy,
    FilePdf
} from 'lucide-react';
import { Link, router } from '@inertiajs/react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Incident {
    id: number;
    title: string;
    description: string;
    type: 'complaint' | 'blotter';
    status: 'pending' | 'under_investigation' | 'resolved' | 'dismissed';
    is_anonymous: boolean;
    reported_as_name: string;
    created_at: string;
    updated_at: string;
    resolved_at: string | null;
    household?: {
        household_number: string;
        head_of_family: string;
    };
    blotter_details?: {
        respondent_name: string;
        hearing_date: string | null;
        mediator_notes?: string | null;
    };
    incident_number?: string;
}

interface Props {
    incident: Incident;
}

const ResidentIncidentShow: React.FC<Props> = ({ incident }) => {
    const [activeTab, setActiveTab] = useState('details');
    const [isMobile, setIsMobile] = useState(false);
    const [showActionsSheet, setShowActionsSheet] = useState(false);
    const [showStatusDetails, setShowStatusDetails] = useState(false);

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
        switch (status) {
            case 'pending': 
                return {
                    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
                    icon: Clock,
                    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
                    description: 'Waiting for review',
                    nextStep: 'Will be assigned for review'
                };
            case 'under_investigation': 
                return {
                    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
                    icon: AlertCircle,
                    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
                    description: 'Being investigated',
                    nextStep: 'Awaiting resolution'
                };
            case 'resolved': 
                return {
                    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
                    icon: CheckCircle,
                    bgColor: 'bg-green-50 dark:bg-green-900/20',
                    description: 'Successfully resolved',
                    nextStep: 'Case closed'
                };
            case 'dismissed': 
                return {
                    color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
                    icon: XCircle,
                    bgColor: 'bg-gray-50 dark:bg-gray-800',
                    description: 'Case dismissed',
                    nextStep: 'No further action'
                };
            default: 
                return {
                    color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
                    icon: Info,
                    bgColor: 'bg-gray-50 dark:bg-gray-800',
                    description: 'Unknown status',
                    nextStep: 'Contact support'
                };
        }
    };

    const getTypeConfig = (type: string) => {
        switch (type) {
            case 'complaint': 
                return {
                    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
                    icon: MessageSquare,
                    label: 'Complaint'
                };
            case 'blotter': 
                return {
                    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
                    icon: Gavel,
                    label: 'Blotter'
                };
            default: 
                return {
                    color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
                    icon: AlertCircle,
                    label: 'Incident'
                };
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        try {
            return format(new Date(dateString), 'MMM dd, yyyy · hh:mm a');
        } catch {
            return 'Invalid date';
        }
    };

    const formatDateOnly = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        try {
            return format(new Date(dateString), 'MMMM dd, yyyy');
        } catch {
            return 'Invalid date';
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleShare = () => {
        const incidentId = incident.incident_number || `BRGY-${incident.id.toString().padStart(6, '0')}`;
        const shareText = `Incident Report: ${incident.title}\n\n` +
                         `Reference: ${incidentId}\n` +
                         `Status: ${incident.status.replace('_', ' ')}\n` +
                         `Type: ${incident.type}\n\n` +
                         `View online: ${window.location.href}`;

        if (navigator.share) {
            navigator.share({
                title: `Incident Report: ${incidentId}`,
                text: shareText,
                url: window.location.href,
            });
        } else if (navigator.clipboard) {
            navigator.clipboard.writeText(shareText);
            toast.success('Incident details copied to clipboard!');
        } else {
            toast.error('Sharing not supported on this device');
        }
    };

    const copyReferenceNumber = () => {
        const refNumber = incident.incident_number || `BRGY-${incident.id.toString().padStart(6, '0')}`;
        navigator.clipboard.writeText(refNumber).then(() => {
            toast.success(`Copied: ${refNumber}`);
        }).catch(() => {
            toast.error('Failed to copy reference number');
        });
    };

    const StatusBanner = () => {
        const statusConfig = getStatusConfig(incident.status);
        const typeConfig = getTypeConfig(incident.type);
        const StatusIcon = statusConfig.icon;
        const TypeIcon = typeConfig.icon;
        
        const borderColorClass = incident.status === 'resolved' 
            ? 'border-l-green-500' 
            : incident.status === 'pending' 
            ? 'border-l-yellow-500' 
            : incident.status === 'dismissed'
            ? 'border-l-gray-500'
            : 'border-l-blue-500';
        
        return (
            <Card className={`border-l-4 ${borderColorClass}`}>
                <CardContent className="p-4">
                    <div className="space-y-4">
                        {/* Status Header */}
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${statusConfig.bgColor}`}>
                                    <StatusIcon className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Current Status</h3>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        <Badge className={`${statusConfig.color} gap-1`}>
                                            <StatusIcon className="h-3 w-3" />
                                            {incident.status.replace('_', ' ').toUpperCase()}
                                        </Badge>
                                        <Badge className={`${typeConfig.color} gap-1`}>
                                            <TypeIcon className="h-3 w-3" />
                                            {typeConfig.label.toUpperCase()}
                                        </Badge>
                                    </div>
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
                                        <p className="text-sm text-gray-500">Reference Number</p>
                                        <div className="flex items-center gap-2">
                                            <p className="font-mono font-medium">
                                                {incident.incident_number || `BRGY-${incident.id.toString().padStart(6, '0')}`}
                                            </p>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 w-6 p-0"
                                                onClick={copyReferenceNumber}
                                            >
                                                <Copy className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Filed Date</p>
                                        <p className="font-medium">{formatDate(incident.created_at)}</p>
                                    </div>
                                </div>
                                
                                {incident.status === 'resolved' && incident.resolved_at && (
                                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                                            <span className="text-sm font-medium text-green-800 dark:text-green-300">
                                                Resolved on {formatDate(incident.resolved_at)}
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

    const IncidentDetailsCard = () => {
        const typeConfig = getTypeConfig(incident.type);
        const TypeIcon = typeConfig.icon;
        
        return (
            <Card>
                <CardHeader className="p-4">
                    <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${typeConfig.color.replace('text-', 'bg-').replace('bg-', 'bg-opacity-20')}`}>
                            <TypeIcon className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="text-base">{incident.title}</CardTitle>
                            <CardDescription className="text-sm">
                                {typeConfig.label} Report
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-4">
                    {/* Description */}
                    <div>
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-2">
                            Incident Description
                        </h3>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                                {incident.description}
                            </p>
                        </div>
                    </div>

                    <Separator />

                    {/* Blotter-specific details */}
                    {incident.type === 'blotter' && incident.blotter_details && (
                        <div className="space-y-4">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                <Gavel className="h-4 w-4" />
                                Blotter Details
                            </h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Respondent</p>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">
                                        {incident.blotter_details.respondent_name}
                                    </p>
                                </div>
                                {incident.blotter_details.hearing_date && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Hearing Date</p>
                                        <p className="font-medium text-gray-900 dark:text-gray-100">
                                            {formatDate(incident.blotter_details.hearing_date)}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {incident.blotter_details.mediator_notes && (
                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                                    <div className="flex items-start gap-2">
                                        <Scale className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
                                                Mediator Notes
                                            </p>
                                            <p className="text-sm text-blue-700 dark:text-blue-400">
                                                {incident.blotter_details.mediator_notes}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
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
                    Incident Timeline
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <div className="relative">
                    {/* Timeline Line */}
                    <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
                    
                    <div className="space-y-6">
                        {/* Filed */}
                        <div className="relative pl-10">
                            <div className="absolute left-4 top-1.5">
                                <div className="w-3 h-3 bg-blue-500 rounded-full ring-4 ring-blue-100 dark:ring-blue-900"></div>
                            </div>
                            <div>
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">Incident Reported</h4>
                                    <span className="text-xs text-gray-500">{formatDate(incident.created_at)}</span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Report was submitted successfully
                                </p>
                            </div>
                        </div>

                        {/* Status Updates */}
                        <div className="relative pl-10">
                            <div className="absolute left-4 top-1.5">
                                <div className="w-3 h-3 bg-blue-500 rounded-full ring-4 ring-blue-100 dark:ring-blue-900"></div>
                            </div>
                            <div>
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 capitalize">
                                        Status: {incident.status.replace('_', ' ')}
                                    </h4>
                                    <span className="text-xs text-gray-500">{formatDate(incident.updated_at)}</span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {incident.status === 'pending' && 'Awaiting initial review by officials'}
                                    {incident.status === 'under_investigation' && 'Currently under investigation'}
                                    {incident.status === 'resolved' && 'Case has been resolved'}
                                    {incident.status === 'dismissed' && 'Case has been dismissed'}
                                </p>
                            </div>
                        </div>

                        {/* Resolution */}
                        {incident.resolved_at && (
                            <div className="relative pl-10">
                                <div className="absolute left-4 top-1.5">
                                    <div className="w-3 h-3 bg-green-500 rounded-full ring-4 ring-green-100 dark:ring-green-900"></div>
                                </div>
                                <div>
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">Case Resolved</h4>
                                        <span className="text-xs text-gray-500">{formatDate(incident.resolved_at)}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        The incident has been successfully resolved
                                    </p>
                                </div>
                            </div>
                        )}
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
            <CardContent className="p-4 pt-0 space-y-4">
                {incident.is_anonymous ? (
                    <div className="text-center py-4">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Shield className="h-8 w-8 text-gray-400" />
                        </div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">Anonymous Report</h4>
                        <p className="text-sm text-gray-500 mt-1">Your identity is protected from public view</p>
                        <div className="mt-3 text-xs text-gray-500">
                            <p>Barangay officials can see your identity for follow-up purposes</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Reported As</p>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{incident.reported_as_name}</p>
                        </div>
                        {incident.household && (
                            <div>
                                <p className="text-sm font-medium text-gray-500">Household</p>
                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                    #{incident.household.household_number}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {incident.household.head_of_family}
                                </p>
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
                <Link href={route('my.incidents.create')}>
                    <Button variant="outline" className="w-full justify-start h-11">
                        <FileText className="h-4 w-4 mr-2" />
                        File New Report
                    </Button>
                </Link>
                <Button variant="outline" className="w-full justify-start h-11" onClick={handlePrint}>
                    <Printer className="h-4 w-4 mr-2" />
                    Print Details
                </Button>
                <Button variant="outline" className="w-full justify-start h-11" onClick={handleShare}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                </Button>
                <Link href={route('my.incidents.index')}>
                    <Button variant="outline" className="w-full justify-start h-11">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Reports
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );

    const HelpCard = () => (
        <Card>
            <CardHeader className="p-4">
                <CardTitle className="text-base flex items-center gap-2">
                    <HelpCircle className="h-5 w-5" />
                    Need Assistance?
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <Phone className="h-5 w-5 text-gray-400" />
                        <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">Emergency Hotline</p>
                            <p className="text-sm text-gray-500">(02) 123-4567</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <Mail className="h-5 w-5 text-gray-400" />
                        <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">Email Support</p>
                            <p className="text-sm text-gray-500">incidents@barangay.gov.ph</p>
                        </div>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <p className="text-sm text-blue-800 dark:text-blue-300">
                            <strong>Reference Number:</strong> {incident.incident_number || `BRGY-${incident.id.toString().padStart(6, '0')}`}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    const MobileTabContent = () => {
        switch (activeTab) {
            case 'details':
                return (
                    <div className="space-y-4">
                        <IncidentDetailsCard />
                        <ReporterInfoCard />
                    </div>
                );
            case 'timeline':
                return (
                    <div className="space-y-4">
                        <TimelineCard />
                        <QuickActionsCard />
                    </div>
                );
            case 'help':
                return <HelpCard />;
            default:
                return (
                    <div className="space-y-4">
                        <IncidentDetailsCard />
                        <ReporterInfoCard />
                    </div>
                );
        }
    };

    return (
        <ResidentLayout
            title={`Incident Report: ${incident.title}`}
            breadcrumbs={[
                { title: 'Dashboard', href: '/resident/dashboard' },
                { title: 'My Incidents', href: route('my.incidents.index') },
                { title: incident.title, href: route('my.incidents.show', incident.id) }
            ]}
            showMobileHeader={true}
        >
            <div className="space-y-4 md:space-y-6">
                {/* Mobile Header */}
                {isMobile && (
                    <div className="flex items-center justify-between md:hidden">
                        <div className="flex items-center gap-2">
                            <Link href={route('my.incidents.index')}>
                                <Button variant="ghost" size="icon" className="h-10 w-10">
                                    <ArrowLeft className="h-5 w-5" />
                                </Button>
                            </Link>
                            <div>
                                <h1 className="font-bold text-lg truncate max-w-[200px]">
                                    {incident.title}
                                </h1>
                                <p className="text-xs text-gray-500 truncate max-w-[200px]">
                                    Filed {formatDateOnly(incident.created_at)}
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
                                    <Link href={route('my.incidents.create')}>
                                        <Button variant="outline" className="w-full justify-start">
                                            <FileText className="h-4 w-4 mr-2" />
                                            File New Report
                                        </Button>
                                    </Link>
                                    <Button variant="outline" className="w-full justify-start" onClick={handlePrint}>
                                        <Printer className="h-4 w-4 mr-2" />
                                        Print
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start" onClick={handleShare}>
                                        <Share2 className="h-4 w-4 mr-2" />
                                        Share
                                    </Button>
                                    <Link href={route('my.incidents.index')}>
                                        <Button variant="outline" className="w-full justify-start">
                                            <ArrowLeft className="h-4 w-4 mr-2" />
                                            Back to Reports
                                        </Button>
                                    </Link>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                )}

                {/* Desktop Header */}
                <div className="hidden md:flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href={route('my.incidents.index')}>
                            <Button variant="ghost" size="sm" className="gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                Back to Reports
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                                {incident.title}
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                                Filed on {formatDate(incident.created_at)}
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
                        <Link href={route('my.incidents.create')}>
                            <Button size="sm" className="gap-2">
                                <FileText className="h-4 w-4" />
                                New Report
                            </Button>
                        </Link>
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
                                <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 pt-2">
                                    <div className="grid grid-cols-3 gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
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
                                
                                <div className="mt-4">
                                    <MobileTabContent />
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <IncidentDetailsCard />
                                <TimelineCard />
                            </div>
                        )}
                    </div>

                    {/* Sidebar - Desktop Only */}
                    {!isMobile && (
                        <div className="space-y-4">
                            <ReporterInfoCard />
                            <QuickActionsCard />
                            <HelpCard />
                        </div>
                    )}
                </div>

                {/* Mobile Bottom Action */}
                {isMobile && (
                    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4 z-40 safe-bottom">
                        <Link href={route('my.incidents.create')} className="w-full">
                            <Button className="w-full" size="lg">
                                <FileText className="h-5 w-5 mr-2" />
                                File New Report
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
                        a[href]:not(.print-link),
                        .sheet-content,
                        .safe-bottom {
                            display: none !important;
                        }
                        
                        body {
                            font-size: 12pt;
                            padding: 0;
                            margin: 0;
                            -webkit-print-color-adjust: exact;
                        }
                        
                        .border {
                            border: 1px solid #e5e7eb !important;
                        }
                        
                        .card {
                            break-inside: avoid;
                            margin-bottom: 16px !important;
                            page-break-inside: avoid;
                        }
                        
                        .grid {
                            display: block !important;
                        }
                        
                        .lg\\:col-span-2 {
                            width: 100% !important;
                        }
                        
                        h1, h2, h3, h4, h5, h6 {
                            color: #111827 !important;
                        }
                        
                        .dark\\:text-gray-100 {
                            color: #111827 !important;
                        }
                        
                        .dark\\:bg-gray-800 {
                            background-color: #f9fafb !important;
                        }
                        
                        .space-y-4 > * + * {
                            margin-top: 1rem !important;
                        }
                    }
                `}
            </style>
        </ResidentLayout>
    );
};

export default ResidentIncidentShow;