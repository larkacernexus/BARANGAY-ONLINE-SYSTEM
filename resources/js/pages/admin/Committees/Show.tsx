// resources/js/Pages/Admin/Committees/Show.tsx
import AppLayout from '@/layouts/admin-app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
    ArrowLeft,
    Edit,
    Target,
    Users,
    CheckCircle,
    XCircle,
    Calendar,
    Clock,
    Link as LinkIcon,
    Copy,
    Trash2,
    Info,
    Hash,
    Tag,
    Award,
    User,
    Phone,
    Mail,
    CalendarDays,
    ClockIcon,
    AlertCircle,
    AlertTriangle,
    Plus,
    ChevronRight,
    ExternalLink,
    Eye,
    RefreshCw,
    Check,
    X,
    Zap,
    BarChart3,
    History,
    FileText,
    MessageSquare,
    Bell,
    UserPlus,
    Star,
    Medal,
    Crown,
    Shield,
    Building2,
    Globe,
    MapPin,
    Home,
    Loader2,
    MoreVertical,
    Settings,
    Download,
    Printer,
    Filter,
    Search,
    LayoutGrid,
    List,
    Grid,
    ArrowUpDown,
    ChevronLeft,
    ChevronRight as ChevronRightIcon,
    Maximize2,
    Minimize2,
    ZoomIn,
    ZoomOut
} from 'lucide-react';
import { Head, Link, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState, useMemo } from 'react';
import { format, parseISO, differenceInDays } from 'date-fns';

// Import Admin Tabs Component - FIXED IMPORT PATH
import { AdminTabsWithContent, AdminTabPanel } from '@/components/adminui/admin-tabs';

interface Position {
    id: number;
    code: string;
    name: string;
    is_active: boolean;
    requires_account: boolean;
    officials_count: number;
    created_at?: string;
    updated_at?: string;
    description?: string;
}

interface Committee {
    id: number;
    code: string;
    name: string;
    description: string;
    order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    positions?: Position[];
    positions_count?: number;
}

interface CommitteeShowProps extends PageProps {
    committee: Committee;
    flash?: {
        success?: string;
        error?: string;
    };
}

// ========== HELPER FUNCTIONS ==========
const formatDate = (dateString: string | null, includeTime: boolean = false) => {
    if (!dateString) return 'N/A';
    try {
        const date = parseISO(dateString);
        return format(date, includeTime ? 'MMM dd, yyyy hh:mm a' : 'MMM dd, yyyy');
    } catch (error) {
        return 'Invalid date';
    }
};

const getStatusVariant = (status: boolean) => {
    return status ? 'default' : 'secondary';
};

const getStatusColor = (status: boolean) => {
    return status 
        ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
        : 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700';
};

const getStatusIcon = (status: boolean) => {
    return status 
        ? <CheckCircle className="h-3 w-3" />
        : <XCircle className="h-3 w-3" />;
};

// ========== POSITION CARD COMPONENT ==========
const PositionCard = ({ position, committeeId }: { position: Position; committeeId: number }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <Link 
            href={`/admin/positions/${position.id}`}
            className="block"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Card className={`
                hover:shadow-md transition-all duration-200 
                ${position.is_active 
                    ? 'border-green-100 dark:border-green-900 hover:border-green-300 dark:hover:border-green-700' 
                    : 'border-gray-200 dark:border-gray-700 opacity-75 hover:opacity-100'
                }
                ${isHovered ? 'scale-[1.02]' : ''}
            `}>
                <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                                <h5 className="font-medium dark:text-gray-200">{position.name}</h5>
                                <Badge 
                                    variant="outline" 
                                    className={position.is_active ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' : ''}
                                >
                                    {position.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>
                            
                            <div className="flex items-center gap-2 flex-wrap">
                                <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded dark:text-gray-300">
                                    {position.code}
                                </code>
                                {position.requires_account && (
                                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800">
                                        <Shield className="h-3 w-3 mr-1" />
                                        Requires Account
                                    </Badge>
                                )}
                            </div>

                            {position.description && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                                    {position.description}
                                </p>
                            )}
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                            <Badge className={`
                                gap-1 
                                ${position.officials_count > 0 
                                    ? 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' 
                                    : 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
                                }
                            `}>
                                <Users className="h-3 w-3" />
                                {position.officials_count}
                            </Badge>
                            
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                            <Eye className="h-3 w-3" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>View position details</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
};

// ========== POSITIONS GRID COMPONENT ==========
const PositionsGrid = ({ positions, committeeId }: { positions: Position[]; committeeId: number }) => {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [search, setSearch] = useState('');

    const filteredPositions = useMemo(() => {
        return positions.filter(position => {
            if (filter === 'active' && !position.is_active) return false;
            if (filter === 'inactive' && position.is_active) return false;
            
            if (search) {
                const searchLower = search.toLowerCase();
                return position.name.toLowerCase().includes(searchLower) ||
                       position.code.toLowerCase().includes(searchLower);
            }
            
            return true;
        });
    }, [positions, filter, search]);

    const activeCount = positions.filter(p => p.is_active).length;
    const inactiveCount = positions.filter(p => !p.is_active).length;

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                            <Users className="h-5 w-5" />
                            Assigned Positions ({positions.length})
                        </CardTitle>
                        <CardDescription className="dark:text-gray-400">
                            Positions that are assigned to this committee
                        </CardDescription>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <div className="flex items-center border rounded-lg dark:border-gray-700">
                            <Button
                                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('grid')}
                                className="rounded-r-none"
                            >
                                <Grid className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={viewMode === 'list' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('list')}
                                className="rounded-l-none"
                            >
                                <List className="h-4 w-4" />
                            </Button>
                        </div>

                        <Link href={`/admin/positions/create?committee_id=${committeeId}`}>
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Position
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search positions by name or code..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-8 pr-4 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                            />
                        </div>
                    </div>
                    
                    <div className="flex gap-2">
                        <Button
                            variant={filter === 'all' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFilter('all')}
                        >
                            All ({positions.length})
                        </Button>
                        <Button
                            variant={filter === 'active' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFilter('active')}
                            className="text-green-600 dark:text-green-400"
                        >
                            Active ({activeCount})
                        </Button>
                        <Button
                            variant={filter === 'inactive' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFilter('inactive')}
                            className="text-gray-600 dark:text-gray-400"
                        >
                            Inactive ({inactiveCount})
                        </Button>
                    </div>
                </div>
            </CardHeader>
            
            <CardContent>
                {filteredPositions.length === 0 ? (
                    <div className="text-center py-12 space-y-4">
                        <Target className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600" />
                        <div>
                            <h4 className="font-medium text-gray-700 dark:text-gray-300">No positions found</h4>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                                {search || filter !== 'all' 
                                    ? 'Try adjusting your filters' 
                                    : 'Create a new position and assign it to this committee'}
                            </p>
                        </div>
                        {!search && filter === 'all' && (
                            <Link href={`/admin/positions/create?committee_id=${committeeId}`}>
                                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create First Position
                                </Button>
                            </Link>
                        )}
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid gap-4 md:grid-cols-2">
                        {filteredPositions.map((position) => (
                            <PositionCard key={position.id} position={position} committeeId={committeeId} />
                        ))}
                    </div>
                ) : (
                    <div className="rounded-md border dark:border-gray-700">
                        <Table>
                            <TableHeader className="dark:bg-gray-900">
                                <TableRow className="dark:border-gray-700">
                                    <TableHead className="dark:text-gray-300">Code</TableHead>
                                    <TableHead className="dark:text-gray-300">Name</TableHead>
                                    <TableHead className="dark:text-gray-300">Status</TableHead>
                                    <TableHead className="dark:text-gray-300">Officials</TableHead>
                                    <TableHead className="dark:text-gray-300">Requirements</TableHead>
                                    <TableHead className="dark:text-gray-300">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredPositions.map((position) => (
                                    <TableRow key={position.id} className="dark:border-gray-700">
                                        <TableCell>
                                            <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded dark:text-gray-300">
                                                {position.code}
                                            </code>
                                        </TableCell>
                                        <TableCell className="font-medium dark:text-gray-200">
                                            <Link href={`/admin/positions/${position.id}`} className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline">
                                                {position.name}
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getStatusColor(position.is_active)}>
                                                {getStatusIcon(position.is_active)}
                                                <span className="ml-1">{position.is_active ? 'Active' : 'Inactive'}</span>
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="gap-1 dark:border-gray-600 dark:text-gray-300">
                                                <Users className="h-3 w-3" />
                                                {position.officials_count}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {position.requires_account ? (
                                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800">
                                                    <Shield className="h-3 w-3 mr-1" />
                                                    Account Required
                                                </Badge>
                                            ) : (
                                                <span className="text-gray-400 dark:text-gray-600">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Link href={`/admin/positions/${position.id}`}>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Link href={`/admin/positions/${position.id}/edit`}>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
            
            <CardFooter className="border-t dark:border-gray-700 pt-4">
                <div className="flex justify-between items-center w-full text-sm text-gray-500 dark:text-gray-400">
                    <span>Showing {filteredPositions.length} of {positions.length} positions</span>
                    <Link href="/admin/positions" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1">
                        Manage all positions
                        <ChevronRight className="h-4 w-4" />
                    </Link>
                </div>
            </CardFooter>
        </Card>
    );
};

// ========== QUICK STATS CARD COMPONENT ==========
const QuickStatsCard = ({ 
    committee,
    activeCount,
    inactiveCount 
}: { 
    committee: Committee;
    activeCount: number;
    inactiveCount: number;
}) => {
    const stats = [
        { label: 'Total Positions', value: committee.positions_count || 0, icon: Users, color: 'blue' },
        { label: 'Active Positions', value: activeCount, icon: CheckCircle, color: 'green' },
        { label: 'Inactive Positions', value: inactiveCount, icon: XCircle, color: 'gray' },
        { label: 'Display Order', value: committee.order, icon: Hash, color: 'purple' },
    ];

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <BarChart3 className="h-5 w-5" />
                    Quick Stats
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <div key={index} className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className={`h-8 w-8 rounded-full bg-${stat.color}-100 dark:bg-${stat.color}-900/30 flex items-center justify-center`}>
                                        <Icon className={`h-4 w-4 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold dark:text-gray-100">{stat.value}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
};

// ========== QUICK ACTIONS CARD COMPONENT ==========
const QuickActionsCard = ({ 
    committee,
    onCopyCode,
    onToggleStatus,
    onDelete
}: { 
    committee: Committee;
    onCopyCode: () => void;
    onToggleStatus: () => void;
    onDelete: () => void;
}) => {
    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <Zap className="h-5 w-5" />
                    Quick Actions
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <Link href={`/admin/positions/create?committee_id=${committee.id}`}>
                    <Button variant="outline" className="w-full justify-start dark:border-gray-600 dark:text-gray-300">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Position to Committee
                    </Button>
                </Link>
                
                <Link href={`/admin/positions?committee=${committee.id}`}>
                    <Button variant="outline" className="w-full justify-start dark:border-gray-600 dark:text-gray-300">
                        <Eye className="h-4 w-4 mr-2" />
                        View All Positions
                    </Button>
                </Link>
                
                <Button
                    variant="outline"
                    className="w-full justify-start dark:border-gray-600 dark:text-gray-300"
                    onClick={onCopyCode}
                >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Committee Code
                </Button>

                <Separator className="dark:bg-gray-700" />

                <Button
                    variant="outline"
                    className={`w-full justify-start ${
                        committee.is_active 
                            ? 'text-amber-600 border-amber-200 hover:bg-amber-50 dark:text-amber-400 dark:border-amber-800 dark:hover:bg-amber-950/50' 
                            : 'text-green-600 border-green-200 hover:bg-green-50 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-950/50'
                    }`}
                    onClick={onToggleStatus}
                >
                    {committee.is_active ? (
                        <>
                            <XCircle className="h-4 w-4 mr-2" />
                            Deactivate Committee
                        </>
                    ) : (
                        <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Activate Committee
                        </>
                    )}
                </Button>

                <Button
                    variant="ghost"
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/50"
                    onClick={onDelete}
                >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Committee
                </Button>
            </CardContent>
        </Card>
    );
};

// ========== TIMELINE CARD COMPONENT ==========
const TimelineCard = ({ committee }: { committee: Committee }) => {
    const events = [
        {
            icon: Calendar,
            label: 'Created',
            date: committee.created_at,
            color: 'blue'
        },
        {
            icon: Clock,
            label: 'Last Updated',
            date: committee.updated_at,
            color: 'green'
        }
    ];

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <Clock className="h-5 w-5" />
                    Timeline
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {events.map((event, index) => {
                        const Icon = event.icon;
                        return (
                            <div key={index} className="flex items-start gap-3">
                                <div className={`h-8 w-8 rounded-full bg-${event.color}-100 dark:bg-${event.color}-900/30 flex items-center justify-center flex-shrink-0`}>
                                    <Icon className={`h-4 w-4 text-${event.color}-600 dark:text-${event.color}-400`} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium dark:text-gray-200">{event.label}</p>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 cursor-help">
                                                    {formatDate(event.date)}
                                                </p>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                {formatDate(event.date, true)}
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
};

// ========== SYSTEM INFO CARD COMPONENT ==========
const SystemInfoCard = ({ committee }: { committee: Committee }) => {
    const infoItems = [
        { label: 'ID', value: `#${committee.id}`, icon: Hash },
        { label: 'Code', value: committee.code, icon: Tag },
        { label: 'Order', value: committee.order, icon: ArrowUpDown },
    ];

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <Info className="h-5 w-5" />
                    System Information
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {infoItems.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <div key={index} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Icon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">{item.label}</span>
                                </div>
                                {item.label === 'Code' ? (
                                    <code className="text-xs bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded dark:text-gray-300">
                                        {item.value}
                                    </code>
                                ) : (
                                    <span className="text-sm font-medium dark:text-gray-200">{item.value}</span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
};

// ========== DANGER ZONE CARD COMPONENT ==========
const DangerZoneCard = ({ 
    committee, 
    onDelete 
}: { 
    committee: Committee; 
    onDelete: () => void;
}) => {
    const canDelete = !(committee.positions_count && committee.positions_count > 0);

    return (
        <Card className="border-red-200 dark:border-red-900 dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="text-red-700 dark:text-red-400 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Danger Zone
                </CardTitle>
                <CardDescription className="text-red-600 dark:text-red-400">
                    Irreversible actions. Proceed with caution.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-950/30 rounded-lg">
                    <div className="space-y-1">
                        <h4 className="font-medium text-red-800 dark:text-red-300">Delete Committee</h4>
                        <p className="text-sm text-red-600 dark:text-red-400">
                            This will permanently delete the committee and remove it from all assigned positions.
                            {!canDelete && (
                                <span className="font-bold block mt-1">
                                    ⚠️ Cannot delete while positions are assigned.
                                </span>
                            )}
                        </p>
                    </div>
                    <Button
                        variant="destructive"
                        onClick={onDelete}
                        disabled={!canDelete}
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

// ========== MAIN COMPONENT ==========
export default function CommitteeShow({ committee }: CommitteeShowProps) {
    const [copied, setCopied] = useState(false);
    const [codeCopied, setCodeCopied] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCodeCopied(true);
        setTimeout(() => setCodeCopied(false), 2000);
    };

    const handleCopyLink = () => {
        const link = window.location.href;
        navigator.clipboard.writeText(link).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const handleCopyCode = () => {
        copyToClipboard(committee.code);
    };

    const handleToggleStatus = () => {
        if (confirm(`Set this committee as ${committee.is_active ? 'inactive' : 'active'}?`)) {
            router.put(`/admin/committees/${committee.id}`, {
                is_active: !committee.is_active,
            }, {
                preserveScroll: true,
            });
        }
    };

    const handleDelete = () => {
        if (committee.positions_count && committee.positions_count > 0) {
            alert('Cannot delete committee with assigned positions. Please reassign or delete positions first.');
            return;
        }
        
        setIsDeleting(true);
        router.delete(`/admin/committees/${committee.id}`, {
            onFinish: () => {
                setIsDeleting(false);
                setShowDeleteDialog(false);
            },
        });
    };

    const handlePrint = () => {
        window.print();
    };

    const handleExport = () => {
        const data = {
            committee: {
                ...committee,
                positions: committee.positions?.map(p => ({
                    id: p.id,
                    code: p.code,
                    name: p.name,
                    is_active: p.is_active,
                    requires_account: p.requires_account,
                    officials_count: p.officials_count
                }))
            }
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `committee-${committee.code}-data.json`;
        a.click();
    };

    const hasPositions = committee.positions && committee.positions.length > 0;
    const activeCount = committee.positions?.filter(p => p.is_active).length || 0;
    const inactiveCount = committee.positions?.filter(p => !p.is_active).length || 0;

    // Tab definitions
    const tabs = [
        { 
            id: 'overview', 
            label: 'Overview', 
            icon: <Info className="h-4 w-4" />,
        },
        { 
            id: 'positions', 
            label: 'Positions', 
            icon: <Users className="h-4 w-4" />,
            count: committee.positions_count 
        },
        { 
            id: 'settings', 
            label: 'Settings', 
            icon: <Settings className="h-4 w-4" />,
        },
    ];

    return (
        <>
            <Head title={`Committee: ${committee.name}`} />
            
            <AppLayout
                title={committee.name}
                breadcrumbs={[
                    { title: 'Dashboard', href: '/dashboard' },
                    { title: 'Committees', href: '/admin/committees' },
                    { title: committee.name, href: `/admin/committees/${committee.id}` }
                ]}
            >
                <TooltipProvider>
                    <div className="space-y-6">
                        {/* Header with Actions */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <Link href="/admin/committees">
                                    <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-300">
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Back to Committees
                                    </Button>
                                </Link>
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center shadow-lg shadow-purple-500/20">
                                        <Target className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight dark:text-gray-100">
                                            {committee.name}
                                        </h1>
                                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                                            <Badge 
                                                className={`${getStatusColor(committee.is_active)} flex items-center gap-1`}
                                            >
                                                {getStatusIcon(committee.is_active)}
                                                {committee.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                            <Badge variant="outline" className="flex items-center gap-1 dark:border-gray-600 dark:text-gray-300">
                                                <Hash className="h-3 w-3" />
                                                Order #{committee.order}
                                            </Badge>
                                            <Badge variant="outline" className="flex items-center gap-1 dark:border-gray-600 dark:text-gray-300">
                                                <Users className="h-3 w-3" />
                                                {committee.positions_count || 0} Positions
                                            </Badge>
                                            <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">
                                                <Tag className="h-3 w-3 mr-1" />
                                                {committee.code}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            onClick={handleCopyLink}
                                            className="dark:border-gray-600 dark:text-gray-300"
                                        >
                                            {copied ? (
                                                <Check className="h-4 w-4 mr-2 text-green-600 dark:text-green-400" />
                                            ) : (
                                                <Copy className="h-4 w-4 mr-2" />
                                            )}
                                            {copied ? 'Copied!' : 'Copy Link'}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Copy committee link to clipboard</TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="outline" size="sm" onClick={handlePrint} className="dark:border-gray-600 dark:text-gray-300">
                                            <Printer className="h-4 w-4 mr-2" />
                                            Print
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Print committee details</TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="outline" size="sm" onClick={handleExport} className="dark:border-gray-600 dark:text-gray-300">
                                            <Download className="h-4 w-4 mr-2" />
                                            Export
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Export committee data</TooltipContent>
                                </Tooltip>

                                <Link href={`/admin/committees/${committee.id}/edit`}>
                                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit
                                    </Button>
                                </Link>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={handleCopyCode}>
                                            <Copy className="h-4 w-4 mr-2" />
                                            Copy Code
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={handleToggleStatus}>
                                            {committee.is_active ? (
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
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem 
                                            onClick={() => setShowDeleteDialog(true)}
                                            className="text-red-600 dark:text-red-400"
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                        {/* Status Banner - For empty committees */}
                        {!hasPositions && (
                            <Card className="border-l-4 border-l-amber-500 dark:bg-gray-900">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <AlertTriangle className="h-5 w-5 text-amber-500 dark:text-amber-400" />
                                            <div>
                                                <p className="font-medium dark:text-gray-100">No Positions Assigned</p>
                                                <p className="text-sm text-amber-600 dark:text-amber-400">
                                                    This committee has no positions assigned yet.
                                                </p>
                                            </div>
                                        </div>
                                        <Link href={`/admin/positions/create?committee_id=${committee.id}`}>
                                            <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-300">
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add Position
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Admin Tabs Component */}
                        <AdminTabsWithContent
                            tabs={tabs}
                            activeTab={activeTab}
                            onTabChange={setActiveTab}
                            variant="underlined"
                            size="md"
                            scrollable={true}
                            showCountBadges={true}
                            lazyLoad={true}
                        >
                            <AdminTabPanel value="overview">
                                <div className="grid gap-6 lg:grid-cols-3">
                                    {/* Left Column - Main Details */}
                                    <div className="lg:col-span-2 space-y-6">
                                        {/* Main Details Card */}
                                        <Card className="dark:bg-gray-900">
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                                                    <Target className="h-5 w-5" />
                                                    Committee Details
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-6">
                                                {/* Code Section */}
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Committee Code</p>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={handleCopyCode}
                                                            className="h-6 text-xs dark:text-gray-400 dark:hover:text-white"
                                                        >
                                                            {codeCopied ? (
                                                                <span className="flex items-center gap-1">
                                                                    <Check className="h-3 w-3" />
                                                                    Copied!
                                                                </span>
                                                            ) : (
                                                                <span className="flex items-center gap-1">
                                                                    <Copy className="h-3 w-3" />
                                                                    Copy
                                                                </span>
                                                            )}
                                                        </Button>
                                                    </div>
                                                    <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                                        <code className="font-mono text-sm flex-1 dark:text-gray-300">{committee.code}</code>
                                                        <LinkIcon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                                    </div>
                                                </div>

                                                <Separator className="dark:bg-gray-700" />

                                                {/* Description Section */}
                                                <div className="space-y-2">
                                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</p>
                                                    {committee.description ? (
                                                        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{committee.description}</p>
                                                        </div>
                                                    ) : (
                                                        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg text-gray-500 dark:text-gray-400 italic">
                                                            No description provided
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Recent Positions Preview */}
                                        {hasPositions && (
                                            <Card className="dark:bg-gray-900">
                                                <CardHeader className="flex flex-row items-center justify-between">
                                                    <div>
                                                        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                                                            <Users className="h-5 w-5" />
                                                            Recent Positions
                                                        </CardTitle>
                                                        <CardDescription className="dark:text-gray-400">
                                                            Latest positions added to this committee
                                                        </CardDescription>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setActiveTab('positions')}
                                                        className="dark:text-gray-400 dark:hover:text-white"
                                                    >
                                                        View All
                                                        <ChevronRight className="h-4 w-4 ml-1" />
                                                    </Button>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="grid gap-3 md:grid-cols-2">
                                                        {committee.positions?.slice(0, 4).map((position) => (
                                                            <PositionCard key={position.id} position={position} committeeId={committee.id} />
                                                        ))}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )}
                                    </div>

                                    {/* Right Column - Sidebar */}
                                    <div className="space-y-6">
                                        <QuickStatsCard 
                                            committee={committee}
                                            activeCount={activeCount}
                                            inactiveCount={inactiveCount}
                                        />
                                        <QuickActionsCard 
                                            committee={committee}
                                            onCopyCode={handleCopyCode}
                                            onToggleStatus={handleToggleStatus}
                                            onDelete={() => setShowDeleteDialog(true)}
                                        />
                                        <TimelineCard committee={committee} />
                                        <SystemInfoCard committee={committee} />
                                    </div>
                                </div>
                            </AdminTabPanel>

                            <AdminTabPanel value="positions">
                                {hasPositions ? (
                                    <PositionsGrid positions={committee.positions!} committeeId={committee.id} />
                                ) : (
                                    <Card className="dark:bg-gray-900">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                                                <Users className="h-5 w-5" />
                                                No Positions Assigned
                                            </CardTitle>
                                            <CardDescription className="dark:text-gray-400">
                                                This committee doesn't have any positions assigned yet
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-center py-12 space-y-4">
                                                <Target className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600" />
                                                <div>
                                                    <h4 className="font-medium text-gray-700 dark:text-gray-300">No positions found</h4>
                                                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                                                        Create a new position and assign it to this committee
                                                    </p>
                                                </div>
                                                <Link href={`/admin/positions/create?committee_id=${committee.id}`}>
                                                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                                                        <Plus className="h-4 w-4 mr-2" />
                                                        Create First Position
                                                    </Button>
                                                </Link>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </AdminTabPanel>

                            <AdminTabPanel value="settings">
                                <div className="grid gap-6 md:grid-cols-2">
                                    <Card className="dark:bg-gray-900">
                                        <CardHeader>
                                            <CardTitle className="dark:text-gray-100">General Settings</CardTitle>
                                            <CardDescription className="dark:text-gray-400">
                                                Configure committee settings
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium dark:text-gray-200">Status</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {committee.is_active ? 'Active' : 'Inactive'}
                                                    </p>
                                                </div>
                                                <Button
                                                    variant={committee.is_active ? 'outline' : 'default'}
                                                    size="sm"
                                                    onClick={handleToggleStatus}
                                                >
                                                    {committee.is_active ? 'Deactivate' : 'Activate'}
                                                </Button>
                                            </div>
                                            
                                            <Separator className="dark:bg-gray-700" />
                                            
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium dark:text-gray-200">Display Order</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        Current order: #{committee.order}
                                                    </p>
                                                </div>
                                                <Link href={`/admin/committees/${committee.id}/edit`}>
                                                    <Button variant="outline" size="sm">
                                                        <Edit className="h-4 w-4 mr-2" />
                                                        Change Order
                                                    </Button>
                                                </Link>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <DangerZoneCard committee={committee} onDelete={() => setShowDeleteDialog(true)} />
                                </div>
                            </AdminTabPanel>
                        </AdminTabsWithContent>
                    </div>

                    {/* Delete Confirmation Dialog */}
                    <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                        <AlertDialogContent className="dark:bg-gray-900">
                            <AlertDialogHeader>
                                <AlertDialogTitle className="dark:text-gray-100">Delete Committee</AlertDialogTitle>
                                <AlertDialogDescription className="dark:text-gray-400">
                                    Are you sure you want to delete the committee "{committee.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel disabled={isDeleting} className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                                    Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleDelete}
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Deleting...
                                        </>
                                    ) : (
                                        'Delete Committee'
                                    )}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </TooltipProvider>
            </AppLayout>
        </>
    );
}