import AppLayout from '@/layouts/admin-app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Search,
    Filter,
    Download,
    Plus,
    MapPin,
    Users,
    Home,
    Phone,
    Edit,
    Eye,
    Trash2,
    RefreshCw,
    ExternalLink,
    MoreVertical,
    Copy,
    Printer,
    ChevronLeft,
    ChevronRight,
    Globe,
    AlertTriangle,
    BarChart3,
    Share2,
    Layers,
    Clipboard
} from 'lucide-react';
import { Link, router, usePage } from '@inertiajs/react';
import { useState, useMemo, useEffect, JSX } from 'react';
import { PageProps } from '@/types';

interface Purok {
    id: number;
    name: string;
    slug: string;
    description: string;
    leader_name: string;
    leader_contact: string;
    google_maps_url: string;
    total_households: number;
    total_residents: number;
    status: string;
    created_at: string;
    households_count?: number;
    residents_count?: number;
}

interface PuroksProps extends PageProps {
    puroks: {
        data: Purok[];
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
        from: number;
        to: number;
    };
    stats: Array<{label: string, value: number | string}>;
    filters: {
        search?: string;
        status?: string;
    };
}

// Helper function to truncate text
const truncateText = (text: string, maxLength: number = 30): string => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

// Helper function for contact number
const formatContactNumber = (contact: string): string => {
    if (!contact) return 'Not assigned';
    if (contact.length <= 12) return contact;
    return truncateText(contact, 12);
};

export default function Puroks({ puroks, stats, filters }: PuroksProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);

    // Track window resize
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Get responsive truncation length
    const getTruncationLength = (type: 'name' | 'description' | 'contact' | 'leader' = 'name'): number => {
        if (typeof window === 'undefined') return 30;
        
        const width = window.innerWidth;
        if (width < 640) { // Mobile
            switch(type) {
                case 'name': return 15;
                case 'description': return 20;
                case 'contact': return 10;
                case 'leader': return 12;
                default: return 15;
            }
        }
        if (width < 768) { // Tablet
            switch(type) {
                case 'name': return 20;
                case 'description': return 25;
                case 'contact': return 12;
                case 'leader': return 15;
                default: return 20;
            }
        }
        if (width < 1024) { // Small desktop
            switch(type) {
                case 'name': return 25;
                case 'description': return 30;
                case 'contact': return 15;
                case 'leader': return 18;
                default: return 25;
            }
        }
        // Large desktop
        switch(type) {
            case 'name': return 30;
            case 'description': return 35;
            case 'contact': return 15;
            case 'leader': return 20;
            default: return 30;
        }
    };

    // Filter puroks
    const filteredPuroks = useMemo(() => {
        let result = [...puroks.data];
        
        // Search filter
        if (search) {
            const searchLower = search.toLowerCase();
            result = result.filter(purok => 
                purok.name.toLowerCase().includes(searchLower) ||
                purok.leader_name.toLowerCase().includes(searchLower) ||
                purok.description.toLowerCase().includes(searchLower) ||
                purok.leader_contact.toLowerCase().includes(searchLower)
            );
        }
        
        // Status filter
        if (statusFilter !== 'all') {
            result = result.filter(purok => purok.status === statusFilter);
        }
        
        return result;
    }, [puroks.data, search, statusFilter]);

    // Calculate pagination
    const totalItems = filteredPuroks.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedPuroks = filteredPuroks.slice(startIndex, endIndex);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [search, statusFilter]);

    const handleSearch = (value: string) => {
        setSearch(value);
        
        const params: any = { ...filters };
        if (value) params.search = value;
        if (statusFilter !== 'all') params.status = statusFilter;
        
        router.get('/admin/puroks', params, {
            preserveState: true,
            replace: true,
        });
    };

    const handleStatusFilter = (status: string) => {
        setStatusFilter(status);
        
        const params: any = { ...filters };
        if (search) params.search = search;
        if (status !== 'all') params.status = status;
        
        router.get('/admin/puroks', params, {
            preserveState: true,
            replace: true,
        });
    };

    const handleClearFilters = () => {
        setSearch('');
        setStatusFilter('all');
        router.get('/admin/puroks', {}, {
            preserveState: true,
            replace: true,
        });
    };

    const handleDelete = (purok: Purok) => {
        if (confirm(`Are you sure you want to delete purok "${purok.name}"? This action cannot be undone.`)) {
            router.delete(`/admin/puroks/${purok.id}`);
        }
    };

    const handleUpdateStatistics = () => {
        if (confirm('Update statistics for all puroks? This will recalculate household and resident counts.')) {
            router.post('/admin/puroks/update-statistics');
        }
    };

    const handleCopyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text).then(() => {
            console.log(`Copied ${label} to clipboard:`, text);
        });
    };

    const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
        const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
            'active': 'default',
            'inactive': 'secondary',
            'pending': 'outline',
            'archived': 'outline'
        };
        return variants[status.toLowerCase()] || 'outline';
    };

    const getStatusIcon = (status: string) => {
        const icons: Record<string, JSX.Element> = {
            'active': <div className="h-2 w-2 rounded-full bg-green-500"></div>,
            'inactive': <div className="h-2 w-2 rounded-full bg-gray-400"></div>,
            'pending': <AlertTriangle className="h-3 w-3 text-amber-500" />,
            'archived': <div className="h-2 w-2 rounded-full bg-gray-300"></div>
        };
        return icons[status.toLowerCase()] || null;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const hasActiveFilters = search || statusFilter !== 'all';

    return (
        <AppLayout
            title="Puroks"
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Puroks', href: '/admin/puroks' }
            ]}
        >
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Purok Management</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                            Manage barangay puroks/zones and their information
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button 
                            variant="outline" 
                            onClick={handleUpdateStatistics}
                            className="h-9"
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Update Stats</span>
                            <span className="sm:hidden">Stats</span>
                        </Button>
                        <Link href="/admin/puroks/create">
                            <Button className="h-9">
                                <Plus className="h-4 w-4 mr-2" />
                                <span className="hidden sm:inline">Add Purok</span>
                                <span className="sm:hidden">Add</span>
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat, index) => (
                        <Card key={index} className="overflow-hidden">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-500">
                                    {stat.label}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl sm:text-2xl font-bold">{stat.value}</div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Search and Filters */}
                <Card className="overflow-hidden">
                    <CardContent className="pt-6">
                        <div className="flex flex-col space-y-4">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <Input 
                                        placeholder="Search puroks by name, leader, or description..." 
                                        className="pl-10"
                                        value={search}
                                        onChange={(e) => handleSearch(e.target.value)}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <select 
                                        className="border rounded px-3 py-2 text-sm w-28"
                                        value={statusFilter}
                                        onChange={(e) => handleStatusFilter(e.target.value)}
                                    >
                                        <option value="all">All Status</option>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                    
                                    <Button 
                                        variant="outline"
                                        className="h-9"
                                        onClick={() => {
                                            const exportUrl = new URL('/admin/puroks/export', window.location.origin);
                                            if (search) exportUrl.searchParams.append('search', search);
                                            if (statusFilter !== 'all') exportUrl.searchParams.append('status', statusFilter);
                                            window.open(exportUrl.toString(), '_blank');
                                        }}
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        <span className="hidden sm:inline">Export</span>
                                    </Button>
                                </div>
                            </div>

                            {/* Active filters indicator and clear button */}
                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                <div className="text-sm text-gray-500">
                                    Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} puroks
                                    {search && ` matching "${search}"`}
                                </div>
                                
                                {hasActiveFilters && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleClearFilters}
                                        className="text-red-600 hover:text-red-700 h-8"
                                    >
                                        Clear All Filters
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Puroks Table */}
                <Card className="overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <CardTitle className="text-lg sm:text-xl">Purok List</CardTitle>
                        <div className="text-sm text-gray-500">
                            Page {currentPage} of {totalPages}
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <div className="min-w-full inline-block align-middle">
                                <div className="overflow-hidden">
                                    <Table className="min-w-full">
                                        <TableHeader>
                                            <TableRow className="bg-gray-50 dark:bg-gray-800">
                                                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[180px]">
                                                    Purok Name
                                                </TableHead>
                                                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                                                    Leader
                                                </TableHead>
                                                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                                                    Map
                                                </TableHead>
                                                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                                                    Households
                                                </TableHead>
                                                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                                                    Residents
                                                </TableHead>
                                                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                                                    Status
                                                </TableHead>
                                                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                                                    Created
                                                </TableHead>
                                                <TableHead className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50 dark:bg-gray-800 min-w-[80px]">
                                                    Actions
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {paginatedPuroks.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                                                        <div className="flex flex-col items-center justify-center space-y-4">
                                                            <MapPin className="h-16 w-16 text-gray-300 dark:text-gray-700" />
                                                            <div>
                                                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                                                    No puroks found
                                                                </h3>
                                                                <p className="text-gray-500 dark:text-gray-400">
                                                                    {hasActiveFilters 
                                                                        ? 'Try changing your filters or search criteria.'
                                                                        : 'Get started by creating a purok.'}
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                {hasActiveFilters && (
                                                                    <Button
                                                                        variant="outline"
                                                                        onClick={handleClearFilters}
                                                                        className="h-8"
                                                                    >
                                                                        Clear Filters
                                                                    </Button>
                                                                )}
                                                                <Link href="/admin/puroks/create">
                                                                    <Button className="h-8">
                                                                        <Plus className="h-3 w-3 mr-1" />
                                                                        Create First Purok
                                                                    </Button>
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                paginatedPuroks.map((purok) => {
                                                    const nameLength = getTruncationLength('name');
                                                    const descLength = getTruncationLength('description');
                                                    const leaderLength = getTruncationLength('leader');
                                                    const contactLength = getTruncationLength('contact');
                                                    
                                                    return (
                                                        <TableRow key={purok.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                                            <TableCell className="px-4 py-3 whitespace-nowrap">
                                                                <div 
                                                                    className="flex items-center gap-3 cursor-text select-text"
                                                                    onDoubleClick={(e) => {
                                                                        const selection = window.getSelection();
                                                                        if (selection) {
                                                                            const range = document.createRange();
                                                                            range.selectNodeContents(e.currentTarget);
                                                                            selection.removeAllRanges();
                                                                            selection.addRange(range);
                                                                        }
                                                                    }}
                                                                    title={`Double-click to select all\nPurok: ${purok.name}\nDescription: ${purok.description}`}
                                                                >
                                                                    <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                                                        <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <div 
                                                                            className="font-medium text-gray-900 dark:text-white truncate"
                                                                            data-full-text={purok.name}
                                                                        >
                                                                            {truncateText(purok.name, nameLength)}
                                                                        </div>
                                                                        {purok.description && (
                                                                            <div 
                                                                                className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1"
                                                                                data-full-text={purok.description}
                                                                            >
                                                                                {truncateText(purok.description, descLength)}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="px-4 py-3">
                                                                {purok.leader_name ? (
                                                                    <div 
                                                                        className="cursor-text select-text"
                                                                        onDoubleClick={(e) => {
                                                                            const selection = window.getSelection();
                                                                            if (selection) {
                                                                                const range = document.createRange();
                                                                                range.selectNodeContents(e.currentTarget);
                                                                                selection.removeAllRanges();
                                                                                selection.addRange(range);
                                                                            }
                                                                        }}
                                                                        title={`Double-click to select all\nLeader: ${purok.leader_name}\nContact: ${purok.leader_contact || 'Not assigned'}`}
                                                                    >
                                                                        <div 
                                                                            className="font-medium truncate"
                                                                            data-full-text={purok.leader_name}
                                                                        >
                                                                            {truncateText(purok.leader_name, leaderLength)}
                                                                        </div>
                                                                        {purok.leader_contact && (
                                                                            <div 
                                                                                className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1 flex items-center gap-1"
                                                                                data-full-text={purok.leader_contact}
                                                                            >
                                                                                <Phone className="h-3 w-3 flex-shrink-0" />
                                                                                {formatContactNumber(purok.leader_contact)}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-gray-400 italic text-sm">Not assigned</span>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="px-4 py-3">
                                                                {purok.google_maps_url ? (
                                                                    <a 
                                                                        href={purok.google_maps_url} 
                                                                        target="_blank" 
                                                                        rel="noopener noreferrer"
                                                                        className="inline-flex items-center gap-1 text-blue-600 hover:underline text-sm"
                                                                        title="Open in Google Maps"
                                                                    >
                                                                        <ExternalLink className="h-4 w-4 flex-shrink-0" />
                                                                        <span className="truncate">View Map</span>
                                                                    </a>
                                                                ) : (
                                                                    <span className="text-gray-400 italic text-sm truncate">No map link</span>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="px-4 py-3">
                                                                <div className="flex items-center gap-2">
                                                                    <Home className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                                                    <span className="truncate">{purok.total_households.toLocaleString()}</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="px-4 py-3">
                                                                <div className="flex items-center gap-2">
                                                                    <Users className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                                                    <span className="truncate">{purok.total_residents.toLocaleString()}</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="px-4 py-3">
                                                                <Badge 
                                                                    variant={getStatusBadgeVariant(purok.status)} 
                                                                    className="flex items-center gap-1 truncate max-w-full"
                                                                    title={purok.status}
                                                                >
                                                                    {getStatusIcon(purok.status)}
                                                                    <span className="truncate capitalize">
                                                                        {purok.status}
                                                                    </span>
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="px-4 py-3">
                                                                <div 
                                                                    className="text-sm text-gray-500 dark:text-gray-400 truncate"
                                                                    title={formatDate(purok.created_at)}
                                                                >
                                                                    {formatDate(purok.created_at)}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="px-4 py-3 text-right sticky right-0 bg-white dark:bg-gray-900">
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button 
                                                                            variant="ghost" 
                                                                            className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                                                                        >
                                                                            <span className="sr-only">Open menu</span>
                                                                            <MoreVertical className="h-4 w-4" />
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end" className="w-48">
                                                                        <DropdownMenuItem asChild>
                                                                            <Link href={`/admin/puroks/${purok.id}`} className="flex items-center cursor-pointer">
                                                                                <Eye className="mr-2 h-4 w-4" />
                                                                                <span>View Details</span>
                                                                            </Link>
                                                                        </DropdownMenuItem>
                                                                        
                                                                        <DropdownMenuItem asChild>
                                                                            <Link href={`/admin/puroks/${purok.id}/edit`} className="flex items-center cursor-pointer">
                                                                                <Edit className="mr-2 h-4 w-4" />
                                                                                <span>Edit Purok</span>
                                                                            </Link>
                                                                        </DropdownMenuItem>
                                                                        
                                                                        <DropdownMenuItem asChild>
                                                                            <Link href={`/residents?purok_id=${purok.id}`} className="flex items-center cursor-pointer">
                                                                                <Users className="mr-2 h-4 w-4" />
                                                                                <span>View Residents</span>
                                                                            </Link>
                                                                        </DropdownMenuItem>
                                                                        
                                                                        <DropdownMenuItem asChild>
                                                                            <Link href={`/households?purok_id=${purok.id}`} className="flex items-center cursor-pointer">
                                                                                <Home className="mr-2 h-4 w-4" />
                                                                                <span>View Households</span>
                                                                            </Link>
                                                                        </DropdownMenuItem>
                                                                        
                                                                        <DropdownMenuSeparator />
                                                                        
                                                                        <DropdownMenuItem 
                                                                            onClick={() => handleCopyToClipboard(purok.name, 'Purok Name')}
                                                                            className="flex items-center cursor-pointer"
                                                                        >
                                                                            <Copy className="mr-2 h-4 w-4" />
                                                                            <span>Copy Name</span>
                                                                        </DropdownMenuItem>
                                                                        
                                                                        {purok.leader_name && (
                                                                            <DropdownMenuItem 
                                                                                onClick={() => handleCopyToClipboard(purok.leader_name, 'Leader Name')}
                                                                                className="flex items-center cursor-pointer"
                                                                            >
                                                                                <Copy className="mr-2 h-4 w-4" />
                                                                                <span>Copy Leader</span>
                                                                            </DropdownMenuItem>
                                                                        )}
                                                                        
                                                                        {purok.google_maps_url && (
                                                                            <DropdownMenuItem 
                                                                                onClick={() => handleCopyToClipboard(purok.google_maps_url, 'Map Link')}
                                                                                className="flex items-center cursor-pointer"
                                                                            >
                                                                                <Copy className="mr-2 h-4 w-4" />
                                                                                <span>Copy Map Link</span>
                                                                            </DropdownMenuItem>
                                                                        )}
                                                                        
                                                                        <DropdownMenuItem asChild>
                                                                            <Link href={`/admin/puroks/${purok.id}/print`} className="flex items-center cursor-pointer">
                                                                                <Printer className="mr-2 h-4 w-4" />
                                                                                <span>Print Details</span>
                                                                            </Link>
                                                                        </DropdownMenuItem>
                                                                        
                                                                        <DropdownMenuSeparator />
                                                                        
                                                                        <DropdownMenuItem 
                                                                            className="text-red-600 focus:text-red-700 focus:bg-red-50"
                                                                            onClick={() => handleDelete(purok)}
                                                                        >
                                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                                            <span>Delete Purok</span>
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mt-4 pt-4 px-4 border-t">
                                <div className="text-sm text-gray-500">
                                    Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} results
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className="h-8"
                                    >
                                        <ChevronLeft className="h-4 w-4 mr-1" />
                                        Previous
                                    </Button>
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            let pageNum;
                                            if (totalPages <= 5) {
                                                pageNum = i + 1;
                                            } else if (currentPage <= 3) {
                                                pageNum = i + 1;
                                            } else if (currentPage >= totalPages - 2) {
                                                pageNum = totalPages - 4 + i;
                                            } else {
                                                pageNum = currentPage - 2 + i;
                                            }
                                            return (
                                                <Button
                                                    key={pageNum}
                                                    variant={currentPage === pageNum ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => setCurrentPage(pageNum)}
                                                    className="h-8 w-8 p-0"
                                                >
                                                    {pageNum}
                                                </Button>
                                            );
                                        })}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
                                        className="h-8"
                                    >
                                        Next
                                        <ChevronRight className="h-4 w-4 ml-1" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Actions & Info */}
                <div className="grid gap-6 sm:grid-cols-2">
                    <Card className="overflow-hidden">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-3">
                                <Link href="/admin/puroks/assign-leaders">
                                    <Button variant="outline" size="sm" className="w-full justify-start h-8">
                                        <Users className="h-3 w-3 mr-2" />
                                        <span className="truncate">Assign Leaders</span>
                                    </Button>
                                </Link>
                                <Link href="/admin/puroks/map">
                                    <Button variant="outline" size="sm" className="w-full justify-start h-8">
                                        <MapPin className="h-3 w-3 mr-2" />
                                        <span className="truncate">View Map</span>
                                    </Button>
                                </Link>
                                <Link href="/admin/puroks/print">
                                    <Button variant="outline" size="sm" className="w-full justify-start h-8">
                                        <Printer className="h-3 w-3 mr-2" />
                                        <span className="truncate">Print Directory</span>
                                    </Button>
                                </Link>
                                <Link href="/admin/puroks/alerts">
                                    <Button variant="outline" size="sm" className="w-full justify-start h-8">
                                        <Share2 className="h-3 w-3 mr-2" />
                                        <span className="truncate">Send Alerts</span>
                                    </Button>
                                </Link>
                                <Button variant="outline" size="sm" className="w-full justify-start h-8 col-span-2">
                                    <BarChart3 className="h-3 w-3 mr-2" />
                                    <span className="truncate">Generate Statistics Report</span>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Purok Distribution</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {paginatedPuroks.length > 0 ? (
                                <div className="space-y-3">
                                    {paginatedPuroks.slice(0, 3).map((purok) => {
                                        const nameLength = getTruncationLength('name');
                                        
                                        return (
                                            <div key={purok.id} className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <span 
                                                        className="text-sm font-medium truncate"
                                                        title={purok.name}
                                                    >
                                                        {truncateText(purok.name, nameLength)}
                                                    </span>
                                                    {purok.google_maps_url && (
                                                        <a 
                                                            href={purok.google_maps_url} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            title="View on Google Maps"
                                                        >
                                                            <ExternalLink className="h-3 w-3 text-gray-400 hover:text-blue-600 flex-shrink-0" />
                                                        </a>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    <Badge variant="outline" className="text-xs">
                                                        {purok.total_households} HH
                                                    </Badge>
                                                    <Badge variant="outline" className="text-xs">
                                                        {purok.total_residents} P
                                                    </Badge>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {paginatedPuroks.length > 3 && (
                                        <div className="text-center pt-2">
                                            <Button 
                                                variant="ghost" 
                                                size="sm"
                                                onClick={() => setCurrentPage(1)}
                                                className="h-8"
                                            >
                                                View All Puroks
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-4 text-sm">No purok data available</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}