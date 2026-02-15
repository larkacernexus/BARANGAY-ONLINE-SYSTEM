import ResidentLayout from '@/layouts/resident-app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    AlertCircle,
    Search,
    Filter,
    Eye,
    MessageSquare,
    Plus,
    Clock,
    CheckCircle,
    XCircle,
    AlertTriangle,
    ThumbsUp,
    Shield,
    MapPin,
    Users,
    BarChart,
    ChevronRight,
    ChevronLeft,
    Smartphone,
    X,
    Download,
    Home,
    Car,
    Volume2,
    Trash2,
    Wifi,
    Calendar,
    FileText,
    Phone,
    Mail,
    Info,
    Loader2,
    ShieldAlert
} from 'lucide-react';
import { Link, usePage } from '@inertiajs/react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

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
    evidence_files: Array<{
        name: string;
        path: string;
        type: string;
        size: number;
    }> | null;
    admin_notes: string | null;
    resolved_at: string | null;
    created_at: string;
    updated_at: string;
    user_id: number;
}

interface Props {
    complaints: {
        data: Complaint[];
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
    };
    stats: {
        total: number;
        resolved: number;
        in_progress: number;
        pending: number;
        satisfaction_rate: number;
        by_type: Record<string, number>;
    };
}

// Unified complaint type configuration
const complaintTypes = [
    { id: 'noise', name: 'Noise', icon: Volume2, color: 'from-orange-100 to-orange-50 dark:from-orange-900/30 dark:to-orange-900/10', iconColor: 'text-orange-600 dark:text-orange-400' },
    { id: 'sanitation', name: 'Sanitation', icon: Trash2, color: 'from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-900/10', iconColor: 'text-amber-600 dark:text-amber-400' },
    { id: 'security', name: 'Security', icon: Shield, color: 'from-red-100 to-red-50 dark:from-red-900/30 dark:to-red-900/10', iconColor: 'text-red-600 dark:text-red-400' },
    { id: 'infrastructure', name: 'Infrastructure', icon: Home, color: 'from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-900/10', iconColor: 'text-blue-600 dark:text-blue-400' },
    { id: 'traffic', name: 'Traffic', icon: Car, color: 'from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-900/10', iconColor: 'text-purple-600 dark:text-purple-400' },
    { id: 'neighbor', name: 'Neighbor', icon: Users, color: 'from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-900/10', iconColor: 'text-green-600 dark:text-green-400' },
    { id: 'utilities', name: 'Utilities', icon: Wifi, color: 'from-cyan-100 to-cyan-50 dark:from-cyan-900/30 dark:to-cyan-900/10', iconColor: 'text-cyan-600 dark:text-cyan-400' },
    { id: 'others', name: 'Others', icon: AlertCircle, color: 'from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900/10', iconColor: 'text-gray-600 dark:text-gray-400' },
];

export default function MyComplaints({ complaints, stats }: Props) {
    const { data: complaintsData } = complaints;
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [priorityFilter, setPriorityFilter] = useState<string>('all');
    const [isMobile, setIsMobile] = useState(false);
    const [showEmergencyModal, setShowEmergencyModal] = useState(false);
    const [isButtonsVisible, setIsButtonsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    
    // Check mobile viewport
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);
    
    // Define hide/show functions (same as FileComplaint)
    const hideButtons = useCallback(() => {
        setIsButtonsVisible(false);
    }, []);
    
    const showButtons = useCallback(() => {
        setIsButtonsVisible(true);
    }, []);
    
    // Handle scroll to hide/show buttons (SAME LOGIC AS FileComplaint)
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
    
    // Filter complaints
    const filteredComplaints = complaintsData.filter(complaint => {
        const matchesSearch = 
            complaint.subject.toLowerCase().includes(search.toLowerCase()) ||
            complaint.complaint_number.toLowerCase().includes(search.toLowerCase()) ||
            complaint.description.toLowerCase().includes(search.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter;
        const matchesPriority = priorityFilter === 'all' || complaint.priority === priorityFilter;
        
        return matchesSearch && matchesStatus && matchesPriority;
    });
    
    // Unified status badge styling
    const getStatusBadge = (status: string) => {
        const config = {
            resolved: { 
                bg: "bg-green-100 dark:bg-green-900/30", 
                text: "text-green-800 dark:text-green-300",
                icon: CheckCircle,
                label: "Resolved"
            },
            under_review: { 
                bg: "bg-blue-100 dark:bg-blue-900/30", 
                text: "text-blue-800 dark:text-blue-300",
                icon: Clock,
                label: "In Review"
            },
            pending: { 
                bg: "bg-amber-100 dark:bg-amber-900/30", 
                text: "text-amber-800 dark:text-amber-300",
                icon: AlertCircle,
                label: "Pending"
            },
            dismissed: { 
                bg: "bg-gray-100 dark:bg-gray-800", 
                text: "text-gray-800 dark:text-gray-300",
                icon: XCircle,
                label: "Dismissed"
            },
        }[status] || { bg: "bg-gray-100", text: "text-gray-800", icon: AlertCircle, label: status };
        
        const Icon = config.icon;
        
        return (
            <Badge className={`${config.bg} ${config.text} border-0 px-2 py-1 flex items-center gap-1`}>
                <Icon className="h-3 w-3" />
                <span>{config.label}</span>
            </Badge>
        );
    };
    
    // Unified priority badge styling
    const getPriorityBadge = (priority: string) => {
        const config = {
            high: { 
                bg: "bg-red-100 dark:bg-red-900/30", 
                text: "text-red-800 dark:text-red-300",
                dot: "bg-red-500",
                label: "High"
            },
            medium: { 
                bg: "bg-amber-100 dark:bg-amber-900/30", 
                text: "text-amber-800 dark:text-amber-300",
                dot: "bg-amber-500",
                label: "Medium"
            },
            low: { 
                bg: "bg-green-100 dark:bg-green-900/30", 
                text: "text-green-800 dark:text-green-300",
                dot: "bg-green-500",
                label: "Low"
            },
        }[priority] || { bg: "bg-gray-100", text: "text-gray-800", dot: "bg-gray-500", label: priority };
        
        return (
            <Badge variant="outline" className={`${config.bg} ${config.text} border-0 flex items-center gap-1`}>
                <span className={`h-2 w-2 rounded-full ${config.dot}`}></span>
                <span>{config.label}</span>
            </Badge>
        );
    };
    
    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), 'MMM dd, yyyy');
        } catch {
            return 'Invalid date';
        }
    };
    
    const getStatusCount = (status: string) => {
        return complaintsData.filter(c => c.status === status).length;
    };
    
    // Mobile complaint card view - unified styling
    const ComplaintCard = ({ complaint }: { complaint: Complaint }) => {
        const typeConfig = complaintTypes.find(t => t.id === complaint.type.toLowerCase()) || complaintTypes[complaintTypes.length - 1];
        const Icon = typeConfig.icon;
        
        return (
            <div className="mb-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 hover:shadow-md transition-all duration-300">
                <div className="p-4">
                    <div className="space-y-3">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className={`p-2 rounded-lg bg-gradient-to-br ${typeConfig.color}`}>
                                        <Icon className={`h-4 w-4 ${typeConfig.iconColor}`} />
                                    </div>
                                    <div>
                                        <span className="font-mono text-sm font-medium text-gray-900 dark:text-gray-100">
                                            #{complaint.complaint_number}
                                        </span>
                                        {complaint.is_anonymous && (
                                            <Shield className="h-3 w-3 text-gray-400 inline ml-2" />
                                        )}
                                    </div>
                                </div>
                                <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                                    {complaint.subject}
                                </h4>
                                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    <MapPin className="h-3 w-3" />
                                    <span className="truncate">{complaint.location}</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                {getPriorityBadge(complaint.priority)}
                                {getStatusBadge(complaint.status)}
                            </div>
                        </div>
                        
                        {/* Details */}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="space-y-1">
                                <p className="text-gray-500 dark:text-gray-400">Date Filed</p>
                                <div className="flex items-center gap-1 font-medium">
                                    <Calendar className="h-3 w-3" />
                                    {formatDate(complaint.created_at)}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-gray-500 dark:text-gray-400">Evidence</p>
                                <div className="flex items-center gap-1 font-medium">
                                    <FileText className="h-3 w-3" />
                                    {complaint.evidence_files?.length || 0} files
                                </div>
                            </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                            <Link 
                                href={`/my-complaints/show/${complaint.id}`} 
                                className="flex-1"
                            >
                                <Button variant="outline" size="sm" className="w-full">
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                </Button>
                            </Link>
                            <div className="flex gap-1 ml-2">
                                {complaint.status === 'under_review' && (
                                    <Button size="sm" variant="ghost">
                                        <MessageSquare className="h-4 w-4" />
                                    </Button>
                                )}
                                {complaint.status === 'resolved' && (
                                    <Button size="sm" variant="ghost">
                                        <ThumbsUp className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };
    
    return (
        <ResidentLayout
            title="My Complaints"
            breadcrumbs={[
                { title: 'Dashboard', href: '/resident/dashboard' },
                { title: 'My Complaints', href: '/resident/complaints' }
            ]}
            showMobileHeader={true}
        >
            <div className="min-h-screen-safe bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
                {/* Mobile Header with Emergency Button */}
                {isMobile && (
                    <div className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
                        <div className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="flex-1 min-w-0">
                                    <h1 className="text-lg font-bold truncate">My Complaints</h1>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate mt-1">
                                        Track and manage your complaints
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setShowEmergencyModal(true)}
                                    className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                                >
                                    <Phone className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Desktop Header */}
                {!isMobile && (
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold">My Complaints</h1>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Track and manage your filed complaints
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => setShowEmergencyModal(true)}
                                >
                                    <Phone className="h-4 w-4 mr-2" />
                                    Emergency
                                </Button>
                                <Link href="/resident/complaints/create">
                                    <Button className="gap-2">
                                        <Plus className="h-4 w-4" />
                                        <span>New Complaint</span>
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Emergency Modal (same as FileComplaint) */}
                {showEmergencyModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-sm w-full">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold text-red-600 dark:text-red-400">Emergency Contact</h3>
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
                                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
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
                                        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                                            Life-threatening emergencies only
                                        </p>
                                    </div>
                                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Phone className="h-5 w-5 text-blue-600" />
                                            <span className="font-bold">Barangay Office</span>
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
                
                <div className="px-4 md:px-6 pb-24 md:pb-6">
                    {/* Stats Grid - Mobile Optimized */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
                        <Card className="border-0 shadow-lg dark:bg-gray-800/50 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs md:text-sm font-medium text-blue-600 dark:text-blue-400">
                                            Total
                                        </p>
                                        <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                                            {stats.total}
                                        </p>
                                    </div>
                                    <div className="p-2 bg-blue-100 dark:bg-blue-800/30 rounded-lg">
                                        <BarChart className="h-5 w-5 md:h-6 md:w-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card className="border-0 shadow-lg dark:bg-gray-800/50 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs md:text-sm font-medium text-green-600 dark:text-green-400">
                                            Resolved
                                        </p>
                                        <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                                            {stats.resolved}
                                        </p>
                                    </div>
                                    <div className="p-2 bg-green-100 dark:bg-green-800/30 rounded-lg">
                                        <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-green-600 dark:text-green-400" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card className="border-0 shadow-lg dark:bg-gray-800/50 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-900/10">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs md:text-sm font-medium text-amber-600 dark:text-amber-400">
                                            In Progress
                                        </p>
                                        <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                                            {stats.in_progress}
                                        </p>
                                    </div>
                                    <div className="p-2 bg-amber-100 dark:bg-amber-800/30 rounded-lg">
                                        <Clock className="h-5 w-5 md:h-6 md:w-6 text-amber-600 dark:text-amber-400" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card className="border-0 shadow-lg dark:bg-gray-800/50 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs md:text-sm font-medium text-purple-600 dark:text-purple-400">
                                            Satisfaction
                                        </p>
                                        <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                                            {stats.satisfaction_rate}%
                                        </p>
                                    </div>
                                    <div className="p-2 bg-purple-100 dark:bg-purple-800/30 rounded-lg">
                                        <ThumbsUp className="h-5 w-5 md:h-6 md:w-6 text-purple-600 dark:text-purple-400" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    
                    {/* Search and Filters Card */}
                    <Card className="border-0 shadow-lg dark:bg-gray-800/50 mb-6">
                        <CardContent className="p-4">
                            <div className="space-y-4">
                                {/* Search */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <Input
                                        placeholder="Search complaints..."
                                        className="pl-10 bg-white dark:bg-gray-800 rounded-lg h-12"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                                
                                {/* Filters Row */}
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex gap-2 flex-wrap">
                                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                                            <SelectTrigger className="w-full md:w-[140px] h-12 md:h-10 rounded-lg">
                                                <SelectValue placeholder="Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Status</SelectItem>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="under_review">In Review</SelectItem>
                                                <SelectItem value="resolved">Resolved</SelectItem>
                                                <SelectItem value="dismissed">Dismissed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        
                                        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                                            <SelectTrigger className="w-full md:w-[140px] h-12 md:h-10 rounded-lg">
                                                <SelectValue placeholder="Priority" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Priority</SelectItem>
                                                <SelectItem value="high">High</SelectItem>
                                                <SelectItem value="medium">Medium</SelectItem>
                                                <SelectItem value="low">Low</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    
                                    {/* Clear Filters */}
                                    {(statusFilter !== 'all' || priorityFilter !== 'all' || search) && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setStatusFilter('all');
                                                setPriorityFilter('all');
                                                setSearch('');
                                            }}
                                            className="text-gray-500 self-start md:self-center"
                                        >
                                            <X className="h-4 w-4 mr-1" />
                                            Clear Filters
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    {/* Status Quick Filters */}
                    <div className="overflow-x-auto pb-4 mb-6">
                        <div className="flex gap-2 min-w-max">
                            <Button
                                variant={statusFilter === 'all' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setStatusFilter('all')}
                                className="whitespace-nowrap rounded-lg"
                            >
                                All ({stats.total})
                            </Button>
                            <Button
                                variant={statusFilter === 'pending' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setStatusFilter('pending')}
                                className="whitespace-nowrap rounded-lg"
                            >
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Pending ({getStatusCount('pending')})
                            </Button>
                            <Button
                                variant={statusFilter === 'under_review' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setStatusFilter('under_review')}
                                className="whitespace-nowrap rounded-lg"
                            >
                                <Clock className="h-3 w-3 mr-1" />
                                In Review ({getStatusCount('under_review')})
                            </Button>
                            <Button
                                variant={statusFilter === 'resolved' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setStatusFilter('resolved')}
                                className="whitespace-nowrap rounded-lg"
                            >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Resolved ({getStatusCount('resolved')})
                            </Button>
                        </div>
                    </div>
                    
                    {/* Complaints List Section */}
                    <div>
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-100">
                                    My Complaints
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    {filteredComplaints.length} complaint{filteredComplaints.length !== 1 ? 's' : ''} found
                                </p>
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 hidden md:block">
                                Showing {filteredComplaints.length} of {complaints.total}
                            </div>
                        </div>
                        
                        {/* Content */}
                        {filteredComplaints.length > 0 ? (
                            <>
                                {/* Mobile View - Cards */}
                                <div className="md:hidden space-y-3">
                                    {filteredComplaints.map((complaint) => (
                                        <ComplaintCard key={complaint.id} complaint={complaint} />
                                    ))}
                                </div>
                                
                                {/* Desktop View - Table */}
                                <div className="hidden md:block">
                                    <div className="border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="rounded-tl-xl">Reference No.</TableHead>
                                                    <TableHead>Type</TableHead>
                                                    <TableHead>Subject</TableHead>
                                                    <TableHead>Date Filed</TableHead>
                                                    <TableHead>Priority</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead className="text-right rounded-tr-xl">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredComplaints.map((complaint) => {
                                                    const typeConfig = complaintTypes.find(t => t.id === complaint.type.toLowerCase()) || complaintTypes[complaintTypes.length - 1];
                                                    const Icon = typeConfig.icon;
                                                    
                                                    return (
                                                        <TableRow key={complaint.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                                            <TableCell className="font-medium">
                                                                <div className="flex items-center gap-2">
                                                                    <div className={`p-2 rounded-lg bg-gradient-to-br ${typeConfig.color}`}>
                                                                        <Icon className={`h-4 w-4 ${typeConfig.iconColor}`} />
                                                                    </div>
                                                                    <div>
                                                                        <span className="font-mono text-sm">#{complaint.complaint_number}</span>
                                                                        {complaint.is_anonymous && (
                                                                            <Shield className="h-3 w-3 text-gray-400 inline ml-2" />
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <span className="capitalize">{complaint.type.replace('_', ' ')}</span>
                                                            </TableCell>
                                                            <TableCell className="max-w-[200px]">
                                                                <div className="font-medium truncate">
                                                                    {complaint.subject}
                                                                </div>
                                                                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 truncate">
                                                                    <MapPin className="h-3 w-3" />
                                                                    {complaint.location}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex items-center gap-1 text-sm">
                                                                    <Calendar className="h-3 w-3" />
                                                                    {formatDate(complaint.created_at)}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>{getPriorityBadge(complaint.priority)}</TableCell>
                                                            <TableCell>{getStatusBadge(complaint.status)}</TableCell>
                                                            <TableCell>
                                                                <div className="flex items-center justify-end gap-2">
                                                                    <Link href={`/my-complaints/show/${complaint.id}`}>
                                                                        <Button size="sm" variant="ghost" className="rounded-lg">
                                                                            <Eye className="h-4 w-4" />
                                                                        </Button>
                                                                    </Link>
                                                                    {complaint.status === 'under_review' && (
                                                                        <Button size="sm" variant="ghost" className="rounded-lg">
                                                                            <MessageSquare className="h-4 w-4" />
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                                
                                {/* Pagination */}
                                {complaints.last_page > 1 && (
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            Page {complaints.current_page} of {complaints.last_page}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={complaints.current_page === 1}
                                                className="gap-1 rounded-lg"
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                                Previous
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={complaints.current_page === complaints.last_page}
                                                className="gap-1 rounded-lg"
                                            >
                                                Next
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-12 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800">
                                <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                    <AlertCircle className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                    No complaints found
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
                                    {search || statusFilter !== 'all' || priorityFilter !== 'all'
                                        ? 'Try adjusting your search or filters to find what you\'re looking for.'
                                        : 'You haven\'t filed any complaints yet. Start by reporting an issue.'}
                                </p>
                                {(!search && statusFilter === 'all' && priorityFilter === 'all') && (
                                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                        <Link href="/resident/complaints/create">
                                            <Button className="rounded-lg">
                                                <Plus className="h-4 w-4 mr-2" />
                                                File Your First Complaint
                                            </Button>
                                        </Link>
                                        <Button variant="outline" className="rounded-lg">
                                            <Download className="h-4 w-4 mr-2" />
                                            How to Report
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Mobile Navigation Footer - SAME PATTERN AS FileComplaint */}
                {isMobile && (
                    <div className={`fixed bottom-16 left-0 right-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 p-4 transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-lg ${
                        isButtonsVisible 
                            ? "translate-y-0 opacity-100" 
                            : "translate-y-full opacity-0"
                    }`}>
                        <div className="flex items-center justify-between gap-3">
                            <Link href="/resident/complaints/create" className="flex-1">
                                <Button className="w-full">
                                    <Plus className="h-4 w-4 mr-2" />
                                    New Complaint
                                </Button>
                            </Link>
                            <div className="flex gap-1">
                                <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl">
                                    <Filter className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl">
                                    <Download className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Floating Action Button for Mobile - SAME AS FileComplaint */}
                {isMobile && (
                    <div className="fixed bottom-6 right-6 z-50">
                        <Link href="/resident/complaints/create">
                            <Button 
                                size="lg" 
                                className="rounded-full h-14 w-14 shadow-lg shadow-blue-500/20"
                            >
                                <Plus className="h-6 w-6" />
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </ResidentLayout>
    );
}