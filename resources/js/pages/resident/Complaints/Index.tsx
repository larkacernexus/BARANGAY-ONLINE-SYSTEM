import ResidentLayout from '@/layouts/resident-app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
    Menu,
    Download,
    Filter as FilterIcon
} from 'lucide-react';
import { Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

export default function MyComplaints({ complaints, stats }: Props) {
    const { data: complaintsData } = complaints;
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [priorityFilter, setPriorityFilter] = useState<string>('all');
    const [showFilters, setShowFilters] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    
    // Check mobile viewport
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);
    
    // Get complaint types from stats
    const complaintTypes = Object.entries(stats.by_type || {}).map(([type, count]) => ({
        type,
        icon: getTypeIcon(type),
        color: getTypeColor(type),
        bgColor: getTypeBgColor(type),
        count
    }));

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

    const getStatusBadge = (status: string) => {
        const config = {
            resolved: { 
                bg: "bg-green-100 dark:bg-green-900/30", 
                text: "text-green-800 dark:text-green-300",
                icon: CheckCircle 
            },
            under_review: { 
                bg: "bg-blue-100 dark:bg-blue-900/30", 
                text: "text-blue-800 dark:text-blue-300",
                icon: Clock 
            },
            pending: { 
                bg: "bg-amber-100 dark:bg-amber-900/30", 
                text: "text-amber-800 dark:text-amber-300",
                icon: AlertCircle 
            },
            dismissed: { 
                bg: "bg-gray-100 dark:bg-gray-800", 
                text: "text-gray-800 dark:text-gray-300",
                icon: XCircle 
            },
        }[status] || { bg: "bg-gray-100", text: "text-gray-800", icon: AlertCircle };

        const Icon = config.icon;
        
        return (
            <Badge className={`${config.bg} ${config.text} border-0 px-2 py-1`}>
                <Icon className="h-3 w-3 mr-1" />
                <span className="capitalize">{status.replace('_', ' ')}</span>
            </Badge>
        );
    };

    const getPriorityBadge = (priority: string) => {
        const config = {
            high: { 
                bg: "bg-red-100 dark:bg-red-900/30", 
                text: "text-red-800 dark:text-red-300",
                dot: "bg-red-500"
            },
            medium: { 
                bg: "bg-amber-100 dark:bg-amber-900/30", 
                text: "text-amber-800 dark:text-amber-300",
                dot: "bg-amber-500"
            },
            low: { 
                bg: "bg-green-100 dark:bg-green-900/30", 
                text: "text-green-800 dark:text-green-300",
                dot: "bg-green-500"
            },
        }[priority] || { bg: "bg-gray-100", text: "text-gray-800", dot: "bg-gray-500" };

        return (
            <Badge variant="outline" className={`${config.bg} ${config.text} border-0`}>
                <span className={`h-2 w-2 rounded-full ${config.dot} mr-2`}></span>
                <span className="capitalize">{priority}</span>
            </Badge>
        );
    };

    function getTypeIcon(type: string) {
        switch (type.toLowerCase()) {
            case 'noise': return AlertCircle;
            case 'sanitation': return AlertTriangle;
            case 'infrastructure': return MapPin;
            case 'security': return Shield;
            case 'traffic': return Users;
            default: return AlertCircle;
        }
    }

    function getTypeColor(type: string) {
        switch (type.toLowerCase()) {
            case 'noise': return 'text-purple-600 dark:text-purple-400';
            case 'sanitation': return 'text-amber-600 dark:text-amber-400';
            case 'infrastructure': return 'text-blue-600 dark:text-blue-400';
            case 'security': return 'text-red-600 dark:text-red-400';
            case 'traffic': return 'text-green-600 dark:text-green-400';
            default: return 'text-gray-600 dark:text-gray-400';
        }
    }

    function getTypeBgColor(type: string) {
        switch (type.toLowerCase()) {
            case 'noise': return 'bg-purple-100 dark:bg-purple-900/30';
            case 'sanitation': return 'bg-amber-100 dark:bg-amber-900/30';
            case 'infrastructure': return 'bg-blue-100 dark:bg-blue-900/30';
            case 'security': return 'bg-red-100 dark:bg-red-900/30';
            case 'traffic': return 'bg-green-100 dark:bg-green-900/30';
            default: return 'bg-gray-100 dark:bg-gray-800';
        }
    }

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

    // Mobile complaint card view
    const ComplaintCard = ({ complaint }: { complaint: Complaint }) => (
        <Card className="mb-4 hover:shadow-md transition-shadow">
            <CardContent className="p-4">
                <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono text-sm font-medium text-gray-900 dark:text-gray-100">
                                    #{complaint.complaint_number}
                                </span>
                                {complaint.is_anonymous && (
                                    <Shield className="h-3 w-3 text-gray-400" />
                                )}
                            </div>
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                                {complaint.subject}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                {complaint.location}
                            </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            {getPriorityBadge(complaint.priority)}
                            {getStatusBadge(complaint.status)}
                        </div>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                            <p className="text-gray-500 dark:text-gray-400">Type</p>
                            <p className="font-medium capitalize">{complaint.type.replace('_', ' ')}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 dark:text-gray-400">Date Filed</p>
                            <p className="font-medium">{formatDate(complaint.created_at)}</p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2 border-t">
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
                            <Button size="sm" variant="ghost">
                                <MessageSquare className="h-4 w-4" />
                            </Button>
                            {complaint.status === 'resolved' && (
                                <Button size="sm" variant="ghost">
                                    <ThumbsUp className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <ResidentLayout
            title="My Complaints"
            breadcrumbs={[
                { title: 'Dashboard', href: '/residentdashboard' },
                { title: 'My Complaints', href: '/my-complaints' }
            ]}
            showMobileHeader={true}
        >
            <div className="space-y-4 md:space-y-6">
                {/* Header - Mobile Optimized */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                                My Complaints
                            </h1>
                            <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-1">
                                Track and manage your filed complaints
                            </p>
                        </div>
                        <Link href="/my-complaints/create" className="hidden md:block">
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" />
                                <span>New Complaint</span>
                            </Button>
                        </Link>
                    </div>

                    {/* Floating Action Button for Mobile */}
                    <div className="fixed bottom-6 right-6 z-50 md:hidden">
                        <Link href="//my-complaints/create">
                            <Button 
                                size="lg" 
                                className="rounded-full h-14 w-14 shadow-lg shadow-blue-500/20"
                            >
                                <Plus className="h-6 w-6" />
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Stats Grid - Mobile Optimized */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10">
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

                    <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10">
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

                    <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-900/10">
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

                    <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10">
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

                {/* Search and Filters - Mobile Optimized */}
                <Card>
                    <CardContent className="p-4">
                        <div className="space-y-4">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input
                                    placeholder="Search complaints..."
                                    className="pl-10 bg-white dark:bg-gray-800"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>

                            {/* Filters Row */}
                            <div className="flex items-center justify-between">
                                <div className="flex gap-2 flex-wrap">
                                    {/* Status Filter */}
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="w-[140px] h-9">
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

                                    {/* Priority Filter */}
                                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                                        <SelectTrigger className="w-[140px] h-9">
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
                                        className="text-gray-500"
                                    >
                                        <X className="h-4 w-4 mr-1" />
                                        Clear
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Status Quick Filters */}
                <div className="overflow-x-auto pb-2">
                    <div className="flex gap-2 min-w-max">
                        <Button
                            variant={statusFilter === 'all' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setStatusFilter('all')}
                            className="whitespace-nowrap"
                        >
                            All ({stats.total})
                        </Button>
                        <Button
                            variant={statusFilter === 'pending' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setStatusFilter('pending')}
                            className="whitespace-nowrap"
                        >
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Pending ({getStatusCount('pending')})
                        </Button>
                        <Button
                            variant={statusFilter === 'under_review' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setStatusFilter('under_review')}
                            className="whitespace-nowrap"
                        >
                            <Clock className="h-3 w-3 mr-1" />
                            In Review ({getStatusCount('under_review')})
                        </Button>
                        <Button
                            variant={statusFilter === 'resolved' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setStatusFilter('resolved')}
                            className="whitespace-nowrap"
                        >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Resolved ({getStatusCount('resolved')})
                        </Button>
                    </div>
                </div>

                {/* Complaint Types - Horizontal Scroll on Mobile */}
                <Card>
                    <CardHeader className="p-4 md:p-6">
                        <CardTitle className="text-lg md:text-xl">Complaint Categories</CardTitle>
                        <CardDescription className="text-sm">
                            Types of complaints you've filed
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 md:p-6 pt-0">
                        <div className="overflow-x-auto pb-4">
                            <div className="flex gap-3 min-w-max md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4">
                                {complaintTypes.map((item, index) => (
                                    <div
                                        key={index}
                                        className={`flex items-center gap-3 p-3 border rounded-lg ${item.bgColor} min-w-[200px] md:min-w-0`}
                                    >
                                        <div className={`p-2 rounded-lg ${item.color.replace('text', 'bg')} bg-opacity-10`}>
                                            <item.icon className={`h-5 w-5 ${item.color}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                                                {item.type}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                {item.count} complaint{item.count !== 1 ? 's' : ''}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Complaints List */}
                <Card>
                    <CardHeader className="p-4 md:p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg md:text-xl">
                                    My Complaints
                                </CardTitle>
                                <CardDescription className="text-sm">
                                    {filteredComplaints.length} complaint{filteredComplaints.length !== 1 ? 's' : ''} found
                                </CardDescription>
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 hidden md:block">
                                Showing {filteredComplaints.length} of {complaints.total}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 md:p-6 pt-0">
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
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Reference No.</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Subject</TableHead>
                                                <TableHead>Date Filed</TableHead>
                                                <TableHead>Priority</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredComplaints.map((complaint) => (
                                                <TableRow key={complaint.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                                    <TableCell className="font-medium">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-mono text-sm">#{complaint.complaint_number}</span>
                                                            {complaint.is_anonymous && (
                                                                <Shield className="h-3 w-3 text-gray-400" />
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="capitalize">{complaint.type.replace('_', ' ')}</span>
                                                    </TableCell>
                                                    <TableCell className="max-w-[200px]">
                                                        <div className="truncate font-medium">
                                                            {complaint.subject}
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                            {complaint.location}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-sm">{formatDate(complaint.created_at)}</div>
                                                    </TableCell>
                                                    <TableCell>{getPriorityBadge(complaint.priority)}</TableCell>
                                                    <TableCell>{getStatusBadge(complaint.status)}</TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Link href={`/my-complaints/show/${complaint.id}`}>
                                                                <Button size="sm" variant="ghost">
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                            </Link>
                                                            <Button size="sm" variant="ghost">
                                                                <MessageSquare className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Pagination */}
                                {complaints.last_page > 1 && (
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-4 mt-4">
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            Page {complaints.current_page} of {complaints.last_page}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={complaints.current_page === 1}
                                                className="gap-1"
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                                Previous
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={complaints.current_page === complaints.last_page}
                                                className="gap-1"
                                            >
                                                Next
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-12">
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
                                        <Link href="/my-complaints/create">
                                            <Button>
                                                <Plus className="h-4 w-4 mr-2" />
                                                File Your First Complaint
                                            </Button>
                                        </Link>
                                        <Button variant="outline">
                                            <Download className="h-4 w-4 mr-2" />
                                            How to Report
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Bottom Navigation for Mobile */}
                {isMobile && (
                    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-3 px-4 flex justify-between items-center z-40 md:hidden">
                        <Button variant="ghost" className="flex flex-col items-center gap-1 h-auto">
                            <BarChart className="h-5 w-5" />
                            <span className="text-xs">Overview</span>
                        </Button>
                        <Button variant="ghost" className="flex flex-col items-center gap-1 h-auto">
                            <Filter className="h-5 w-5" />
                            <span className="text-xs">Filters</span>
                        </Button>
                        <Button variant="ghost" className="flex flex-col items-center gap-1 h-auto">
                            <Download className="h-5 w-5" />
                            <span className="text-xs">Export</span>
                        </Button>
                        <Button variant="ghost" className="flex flex-col items-center gap-1 h-auto">
                            <Smartphone className="h-5 w-5" />
                            <span className="text-xs">App</span>
                        </Button>
                    </div>
                )}
            </div>
        </ResidentLayout>
    );
}