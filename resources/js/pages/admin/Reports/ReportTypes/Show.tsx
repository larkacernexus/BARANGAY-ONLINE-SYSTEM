// app/pages/admin/Reports/ReportTypes/Show.tsx
import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import AppLayout from '@/layouts/admin-app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    ArrowLeft,
    Edit,
    Trash2,
    Copy,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Clock,
    Users,
    FileText,
    Image,
    Eye,
    Download,
    Printer,
    Calendar,
    Shield,
    Globe,
    User,
    Mail,
    Phone,
    MapPin,
    Tag,
    Layers,
    Settings,
    Activity,
    BarChart,
    ListChecks,
    Target,
    AlertCircle,
    HelpCircle,
    Sparkles,
    Zap,
    HeartPulse,
    PawPrint,
    Volume2,
    Droplets,
    Zap as ZapIcon,
    Map,
    ShieldAlert,
    Building,
    Car,
    Waves,
    Store,
    Trash2 as TrashIcon,
    UserCog,
    FileCheck,
    FileX,
    Clock4,
    Clock8,
    Clock12,
} from 'lucide-react';
import { route } from 'ziggy-js';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ReportType {
    id: number;
    code: string;
    name: string;
    category: string | null;
    subcategory: string | null;
    description: string | null;
    icon: string;
    color: string;
    priority_level: number;
    resolution_days: number;
    is_active: boolean;
    requires_immediate_action: boolean;
    requires_evidence: boolean;
    allows_anonymous: boolean;
    required_fields: any[];
    resolution_steps: any[];
    assigned_to_roles: string[];
    created_at: string;
    updated_at: string;
    community_reports_count: number;
    priority_label: string;
    priority_color: string;
    priority_icon: string;
    expected_resolution_date: string;
}

interface ReportStats {
    total: number;
    pending: number;
    in_progress: number;
    resolved: number;
    closed: number;
    with_evidence: number;
    anonymous: number;
}

interface PageProps {
    reportType: ReportType;
    recentReports: any[];
    reportStats: ReportStats;
}

export default function ReportTypeShow() {
    const { props } = usePage<PageProps>();
    const { reportType, recentReports = [], reportStats } = props;

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
    const [showStatusDialog, setShowStatusDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDuplicating, setIsDuplicating] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    // Get icon component based on string
    const getIconComponent = (iconName: string) => {
        const icons: Record<string, any> = {
            'alert-triangle': AlertTriangle,
            'alert-circle': AlertCircle,
            'alert-octagon': AlertTriangle,
            'volume-2': Volume2,
            'trash-2': TrashIcon,
            'paw-print': PawPrint,
            'droplets': Droplets,
            'zap': ZapIcon,
            'road': Map,
            'shield-alert': ShieldAlert,
            'users': Users,
            'heart-pulse': HeartPulse,
            'building': Building,
            'car': Car,
            'waves': Waves,
            'store': Store,
            'file-text': FileText,
            'image': Image,
            'clock': Clock,
            'help-circle': HelpCircle,
            'sparkles': Sparkles,
            'target': Target,
            'bar-chart': BarChart,
            'list-checks': ListChecks,
            'activity': Activity,
            'settings': Settings,
            'user-cog': UserCog,
        };
        return icons[iconName] || AlertCircle;
    };

    const IconComponent = getIconComponent(reportType.icon);

    // Get priority icon
    const getPriorityIcon = (level: number) => {
        switch(level) {
            case 1: return <Zap className="h-4 w-4 text-red-600" />;
            case 2: return <AlertTriangle className="h-4 w-4 text-orange-600" />;
            case 3: return <Clock className="h-4 w-4 text-yellow-600" />;
            case 4: return <Clock4 className="h-4 w-4 text-green-600" />;
            default: return <Clock className="h-4 w-4" />;
        }
    };

    // Get status badge
    const getStatusBadge = () => {
        if (reportType.is_active) {
            return (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                </Badge>
            );
        }
        return (
            <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400">
                <XCircle className="h-3 w-3 mr-1" />
                Inactive
            </Badge>
        );
    };

    // Get requirement badges
    const getRequirementBadges = () => {
        const badges = [];

        if (reportType.requires_immediate_action) {
            badges.push(
                <Badge key="immediate" className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                    <Zap className="h-3 w-3 mr-1" />
                    Immediate Action
                </Badge>
            );
        }

        if (reportType.requires_evidence) {
            badges.push(
                <Badge key="evidence" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                    <Image className="h-3 w-3 mr-1" />
                    Evidence Required
                </Badge>
            );
        }

        if (reportType.allows_anonymous) {
            badges.push(
                <Badge key="anonymous" className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                    <User className="h-3 w-3 mr-1" />
                    Anonymous Allowed
                </Badge>
            );
        }

        return badges;
    };

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Handle back navigation
    const handleBack = () => {
        router.visit(route('admin.report-types.index'));
    };

    // Handle edit
    const handleEdit = () => {
        router.visit(route('admin.report-types.edit', reportType.id));
    };

    // Handle delete
    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(route('admin.report-types.destroy', reportType.id), {
            onSuccess: () => {
                toast.success('Report type deleted successfully');
                router.visit(route('admin.report-types.index'));
            },
            onError: () => {
                toast.error('Failed to delete report type');
                setIsDeleting(false);
                setShowDeleteDialog(false);
            },
            onFinish: () => {
                setIsDeleting(false);
            }
        });
    };

    // Handle duplicate
    const handleDuplicate = () => {
        setIsDuplicating(true);
        router.post(route('report-types.duplicate', reportType.id), {}, {
            onSuccess: (response: any) => {
                toast.success('Report type duplicated successfully');
                if (response.props?.reportType?.id) {
                    router.visit(route('admin.report-types.show', response.props.reportType.id));
                } else {
                    router.visit(route('admin.report-types.index'));
                }
            },
            onError: () => {
                toast.error('Failed to duplicate report type');
                setIsDuplicating(false);
                setShowDuplicateDialog(false);
            },
            onFinish: () => {
                setIsDuplicating(false);
            }
        });
    };

    // Handle toggle status
    const handleToggleStatus = () => {
        router.post(route('report-types.toggle-status', reportType.id), {}, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`Report type ${reportType.is_active ? 'deactivated' : 'activated'} successfully`);
                setShowStatusDialog(false);
            },
            onError: () => {
                toast.error('Failed to toggle status');
            }
        });
    };

    // Handle toggle immediate action
    const handleToggleImmediateAction = () => {
        router.post(route('report-types.toggle-immediate-action', reportType.id), {}, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`Immediate action flag ${reportType.requires_immediate_action ? 'disabled' : 'enabled'} successfully`);
            },
            onError: () => {
                toast.error('Failed to toggle immediate action flag');
            }
        });
    };

    return (
        <AppLayout
            title={`Report Type: ${reportType.name}`}
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Report Types', href: '/report-types' },
                { title: reportType.name, href: `/report-types/${reportType.id}` }
            ]}
        >
            <TooltipProvider>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleBack}
                                className="h-8 w-8"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <div className="flex items-center gap-3">
                                <div 
                                    className="h-10 w-10 rounded-lg flex items-center justify-center"
                                    style={{ backgroundColor: reportType.color + '20', color: reportType.color }}
                                >
                                    <IconComponent className="h-5 w-5" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold tracking-tight">{reportType.name}</h1>
                                    <p className="text-sm text-muted-foreground">
                                        Code: <span className="font-mono">{reportType.code}</span>
                                        {reportType.category && (
                                            <>
                                                <span className="mx-2">•</span>
                                                Category: <span className="font-medium">{reportType.category}</span>
                                            </>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="gap-2">
                                        <Settings className="h-4 w-4" />
                                        Actions
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={handleEdit}>
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit Report Type
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setShowDuplicateDialog(true)}>
                                        <Copy className="h-4 w-4 mr-2" />
                                        Duplicate
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => setShowStatusDialog(true)}>
                                        {reportType.is_active ? (
                                            <>
                                                <XCircle className="h-4 w-4 mr-2" />
                                                Deactivate
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                Activate
                                            </>
                                        )}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleToggleImmediateAction}>
                                        {reportType.requires_immediate_action ? (
                                            <>
                                                <Clock className="h-4 w-4 mr-2" />
                                                Remove Immediate Action
                                            </>
                                        ) : (
                                            <>
                                                <Zap className="h-4 w-4 mr-2" />
                                                Mark as Immediate Action
                                            </>
                                        )}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                        onClick={() => setShowDeleteDialog(true)}
                                        className="text-red-600 focus:text-red-600"
                                        disabled={reportType.community_reports_count > 0}
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <Button
                                variant="default"
                                size="sm"
                                onClick={handleEdit}
                                className="gap-2"
                            >
                                <Edit className="h-4 w-4" />
                                Edit
                            </Button>
                        </div>
                    </div>

                    {/* Status Cards */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Status</p>
                                        <div className="mt-1">
                                            {getStatusBadge()}
                                        </div>
                                    </div>
                                    <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                                        <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Priority Level</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            {getPriorityIcon(reportType.priority_level)}
                                            <span className="font-semibold">{reportType.priority_label}</span>
                                        </div>
                                    </div>
                                    <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                                        <Target className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Resolution Time</p>
                                        <p className="text-2xl font-bold mt-1">{reportType.resolution_days} days</p>
                                        <p className="text-xs text-muted-foreground">
                                            Expected: {reportType.expected_resolution_date}
                                        </p>
                                    </div>
                                    <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                                        <Clock className="h-6 w-6 text-green-600 dark:text-green-400" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Total Reports</p>
                                        <p className="text-2xl font-bold mt-1">{reportType.community_reports_count}</p>
                                        <div className="flex gap-2 mt-1 text-xs">
                                            <span className="text-yellow-600">Pending: {reportStats?.pending || 0}</span>
                                            <span className="text-green-600">Resolved: {reportStats?.resolved || 0}</span>
                                        </div>
                                    </div>
                                    <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                                        <BarChart className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Requirement Badges */}
                    <div className="flex flex-wrap gap-2">
                        {getRequirementBadges()}
                    </div>

                    {/* Main Content Tabs */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                        <TabsList className="grid w-full grid-cols-4 lg:w-auto">
                            <TabsTrigger value="overview" className="gap-2">
                                <FileText className="h-4 w-4" />
                                <span className="hidden sm:inline">Overview</span>
                            </TabsTrigger>
                            <TabsTrigger value="fields" className="gap-2">
                                <ListChecks className="h-4 w-4" />
                                <span className="hidden sm:inline">Required Fields</span>
                            </TabsTrigger>
                            <TabsTrigger value="steps" className="gap-2">
                                <Activity className="h-4 w-4" />
                                <span className="hidden sm:inline">Resolution Steps</span>
                            </TabsTrigger>
                            <TabsTrigger value="reports" className="gap-2">
                                <FileText className="h-4 w-4" />
                                <span className="hidden sm:inline">Recent Reports</span>
                            </TabsTrigger>
                        </TabsList>

                        {/* Overview Tab */}
                        <TabsContent value="overview" className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                {/* Basic Information */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Basic Information</CardTitle>
                                        <CardDescription>
                                            General information about this report type
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">ID</p>
                                                <p className="text-sm font-mono mt-1">{reportType.id}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Code</p>
                                                <p className="text-sm font-mono mt-1">{reportType.code}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Category</p>
                                                <p className="text-sm mt-1 capitalize">{reportType.category || 'Uncategorized'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Subcategory</p>
                                                <p className="text-sm mt-1 capitalize">{reportType.subcategory || 'None'}</p>
                                            </div>
                                            <div className="col-span-2">
                                                <p className="text-sm font-medium text-muted-foreground">Description</p>
                                                <p className="text-sm mt-1">
                                                    {reportType.description || 'No description provided'}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Assignment Information */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Assignment & Roles</CardTitle>
                                        <CardDescription>
                                            Personnel assigned to handle this report type
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {reportType.assigned_to_roles && reportType.assigned_to_roles.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {reportType.assigned_to_roles.map((role, index) => (
                                                    <Badge key={index} variant="outline" className="text-xs">
                                                        <UserCog className="h-3 w-3 mr-1" />
                                                        {role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                    </Badge>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">No specific roles assigned</p>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Statistics */}
                                <Card className="md:col-span-2">
                                    <CardHeader>
                                        <CardTitle>Report Statistics</CardTitle>
                                        <CardDescription>
                                            Overview of reports filed under this type
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid gap-4 md:grid-cols-4">
                                            <div className="text-center">
                                                <p className="text-3xl font-bold">{reportStats?.total || 0}</p>
                                                <p className="text-xs text-muted-foreground">Total Reports</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-3xl font-bold text-yellow-600">{reportStats?.pending || 0}</p>
                                                <p className="text-xs text-muted-foreground">Pending</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-3xl font-bold text-blue-600">{reportStats?.in_progress || 0}</p>
                                                <p className="text-xs text-muted-foreground">In Progress</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-3xl font-bold text-green-600">{reportStats?.resolved || 0}</p>
                                                <p className="text-xs text-muted-foreground">Resolved</p>
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            <Progress value={reportStats?.resolved ? (reportStats.resolved / (reportStats.total || 1)) * 100 : 0} className="h-2" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* Required Fields Tab */}
                        <TabsContent value="fields" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Required Fields</CardTitle>
                                    <CardDescription>
                                        Fields that must be filled when submitting this report type
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {reportType.required_fields && reportType.required_fields.length > 0 ? (
                                        <div className="grid gap-4 md:grid-cols-2">
                                            {reportType.required_fields.map((field, index) => (
                                                <Card key={index} className="border border-muted">
                                                    <CardContent className="pt-4">
                                                        <div className="flex items-start justify-between">
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-medium">{field.label}</span>
                                                                    {field.required && (
                                                                        <Badge variant="destructive" className="text-xs">Required</Badge>
                                                                    )}
                                                                </div>
                                                                <p className="text-xs text-muted-foreground mt-1">
                                                                    Key: <span className="font-mono">{field.key}</span>
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    Type: <span className="capitalize">{field.type}</span>
                                                                </p>
                                                                {field.placeholder && (
                                                                    <p className="text-xs text-muted-foreground mt-1">
                                                                        Placeholder: "{field.placeholder}"
                                                                    </p>
                                                                )}
                                                                {field.options && field.options.length > 0 && (
                                                                    <div className="mt-2">
                                                                        <p className="text-xs font-medium mb-1">Options:</p>
                                                                        <div className="flex flex-wrap gap-1">
                                                                            {field.options.map((opt: string, i: number) => (
                                                                                <Badge key={i} variant="outline" className="text-xs">
                                                                                    {opt}
                                                                                </Badge>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                                                <ListChecks className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                                            </div>
                                            <h3 className="text-lg font-semibold mb-2">No Custom Fields</h3>
                                            <p className="text-sm text-muted-foreground">
                                                This report type uses default fields only.
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Resolution Steps Tab */}
                        <TabsContent value="steps" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Resolution Steps</CardTitle>
                                    <CardDescription>
                                        Standard process for resolving this type of report
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {reportType.resolution_steps && reportType.resolution_steps.length > 0 ? (
                                        <div className="space-y-4">
                                            {reportType.resolution_steps.map((step, index) => (
                                                <div key={index} className="flex gap-4">
                                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <span className="text-sm font-bold text-primary">{step.step}</span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-medium">{step.action}</h4>
                                                        <p className="text-sm text-muted-foreground">{step.description}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                                                <Activity className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                                            </div>
                                            <h3 className="text-lg font-semibold mb-2">No Resolution Steps Defined</h3>
                                            <p className="text-sm text-muted-foreground">
                                                This report type uses default resolution steps.
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Recent Reports Tab */}
                        <TabsContent value="reports" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Recent Reports</CardTitle>
                                    <CardDescription>
                                        Latest reports filed under this type
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {recentReports.length > 0 ? (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Reference #</TableHead>
                                                    <TableHead>Title</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead>Priority</TableHead>
                                                    <TableHead>Reporter</TableHead>
                                                    <TableHead>Assigned To</TableHead>
                                                    <TableHead>Created</TableHead>
                                                    <TableHead>Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {recentReports.map((report: any) => (
                                                    <TableRow key={report.id}>
                                                        <TableCell className="font-mono text-xs">
                                                            {report.reference_number}
                                                        </TableCell>
                                                        <TableCell className="font-medium">
                                                            {report.title}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant={
                                                                report.status === 'resolved' ? 'default' :
                                                                report.status === 'pending' ? 'outline' :
                                                                report.status === 'in_progress' ? 'secondary' :
                                                                'destructive'
                                                            }>
                                                                {report.status}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-1">
                                                                {getPriorityIcon(report.priority_level)}
                                                                <span className="text-xs">L{report.priority_level}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>{report.reporter_name}</TableCell>
                                                        <TableCell>{report.assigned_to_name}</TableCell>
                                                        <TableCell>{new Date(report.created_at).toLocaleDateString()}</TableCell>
                                                        <TableCell>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                asChild
                                                            >
                                                                <a href={route('admin.community-reports.show', report.id)}>
                                                                    <Eye className="h-4 w-4" />
                                                                </a>
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    ) : (
                                        <div className="text-center py-12">
                                            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                                                <FileText className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                                            </div>
                                            <h3 className="text-lg font-semibold mb-2">No Reports Yet</h3>
                                            <p className="text-sm text-muted-foreground">
                                                No reports have been filed under this type.
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </TooltipProvider>

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Report Type</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{reportType.name}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    {reportType.community_reports_count > 0 && (
                        <div className="bg-destructive/10 p-3 rounded-lg">
                            <p className="text-sm text-destructive">
                                <AlertCircle className="h-4 w-4 inline mr-1" />
                                This report type has {reportType.community_reports_count} associated report(s). 
                                You cannot delete it while reports exist.
                            </p>
                        </div>
                    )}
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteDialog(false)}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting || reportType.community_reports_count > 0}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Duplicate Confirmation Dialog */}
            <Dialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Duplicate Report Type</DialogTitle>
                        <DialogDescription>
                            Create a copy of "{reportType.name}"? The new report type will have "(Copy)" appended to its name.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowDuplicateDialog(false)}
                            disabled={isDuplicating}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="default"
                            onClick={handleDuplicate}
                            disabled={isDuplicating}
                        >
                            {isDuplicating ? 'Duplicating...' : 'Duplicate'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Status Toggle Confirmation Dialog */}
            <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{reportType.is_active ? 'Deactivate' : 'Activate'} Report Type</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to {reportType.is_active ? 'deactivate' : 'activate'} "{reportType.name}"?
                            {reportType.is_active 
                                ? ' This will prevent new reports from being filed under this type.'
                                : ' This will allow new reports to be filed under this type.'}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowStatusDialog(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant={reportType.is_active ? 'destructive' : 'default'}
                            onClick={handleToggleStatus}
                        >
                            {reportType.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}