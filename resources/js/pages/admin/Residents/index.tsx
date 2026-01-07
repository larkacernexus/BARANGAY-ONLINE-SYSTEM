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
    Download,
    Plus,
    User,
    Home,
    Phone,
    Edit,
    Eye,
    Trash2,
    Filter,
    ChevronDown,
    ChevronUp,
    MoreVertical,
    FileText,
    QrCode,
    Clipboard,
    AlertCircle,
    Camera,
    Crown
} from 'lucide-react';
import { Link, router } from '@inertiajs/react';
import { useState, useMemo, useEffect } from 'react';
import { PageProps } from '@/types';

interface HouseholdMembership {
    id: number;
    household_id: number;
    resident_id: number;
    relationship_to_head: string;
    is_head: boolean;
    household?: {
        id: number;
        household_number: string;
        head_of_family: string;
    };
}

interface Resident {
    id: number;
    first_name: string;
    last_name: string;
    middle_name?: string;
    age: number;
    gender: string;
    contact_number: string;
    address: string;
    purok_id?: number;
    purok?: {
        id: number;
        name: string;
    };
    status: string;
    created_at: string;
    household_memberships?: HouseholdMembership[];
    full_name?: string;
    birth_date?: string;
    civil_status?: string;
    occupation?: string;
    educational_attainment?: string;
    is_voter?: boolean;
    is_4ps_beneficiary?: boolean;
    is_pwd?: boolean;
    photo_path?: string;
    photo_url?: string;
}

interface ResidentsProps extends PageProps {
    residents: {
        data: Resident[];
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
        from: number;
        to: number;
    };
    stats: {
        total: number;
        active: number;
        newThisMonth: number;
        totalHouseholds: number;
        avgAge: number;
        maleCount: number;
        femaleCount: number;
        otherCount: number;
        voterCount: number;
        seniorCount: number;
        pwdCount: number;
        headCount: number;
    };
    filters: {
        search?: string;
        status?: string;
        purok_id?: string;
        gender?: string;
        min_age?: string;
        max_age?: string;
        civil_status?: string;
        is_voter?: string;
        is_head?: string;
        is_4ps?: string;
        sort_by?: string;
        sort_order?: string;
    };
    puroks: Array<{ id: number, name: string }>;
    civilStatusOptions: string[];
    ageRanges: Array<{ label: string, min: number, max: number }>;
    allResidents: Resident[];
}

// Helper function to truncate text
const truncateText = (text: string, maxLength: number = 30): string => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

// Helper function to truncate address
const truncateAddress = (address: string, maxLength: number = 40): string => {
    if (!address) return 'N/A';
    if (address.length <= maxLength) return address;
    return address.substring(0, maxLength) + '...';
};

// Helper function for contact number
const formatContactNumber = (contact: string): string => {
    if (!contact) return 'N/A';
    if (contact.length <= 12) return contact;
    return truncateText(contact, 12);
};

// Helper function to get photo URL
const getPhotoUrl = (photoPath?: string, photoUrl?: string): string | null => {
    if (photoUrl) return photoUrl;
    if (!photoPath) return null;
    
    if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
        return photoPath;
    }
    
    const cleanPath = photoPath.replace('public/', '');
    
    if (cleanPath.startsWith('storage/')) {
        return `/${cleanPath}`;
    }
    
    if (cleanPath.includes('resident-photos') || cleanPath.includes('resident_photos')) {
        return `/storage/${cleanPath}`;
    }
    
    return `/storage/${cleanPath}`;
};

// Helper function to get household information from memberships
const getHouseholdInfo = (resident: Resident) => {
    if (!resident.household_memberships || resident.household_memberships.length === 0) {
        return null;
    }
    
    const membership = resident.household_memberships[0];
    
    if (membership.household) {
        return {
            id: membership.household.id,
            household_number: membership.household.household_number,
            head_of_family: membership.household.head_of_family,
            relationship_to_head: membership.relationship_to_head,
            is_head: membership.is_head
        };
    }
    
    return null;
};

// Helper function to check if resident is head of household
const isHeadOfHousehold = (resident: Resident): boolean => {
    if (!resident.household_memberships || resident.household_memberships.length === 0) {
        return false;
    }
    
    return resident.household_memberships.some(membership => membership.is_head);
};

export default function Residents({ residents, stats, filters, puroks, civilStatusOptions = [], ageRanges = [], allResidents }: ResidentsProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [purokFilter, setPurokFilter] = useState(filters.purok_id || 'all');
    const [genderFilter, setGenderFilter] = useState(filters.gender || 'all');
    const [minAgeFilter, setMinAgeFilter] = useState(filters.min_age || '');
    const [maxAgeFilter, setMaxAgeFilter] = useState(filters.max_age || '');
    const [civilStatusFilter, setCivilStatusFilter] = useState(filters.civil_status || 'all');
    const [voterFilter, setVoterFilter] = useState(filters.is_voter || 'all');
    const [headFilter, setHeadFilter] = useState(filters.is_head || 'all');
    const [sortBy, setSortBy] = useState(filters.sort_by || 'last_name');
    const [sortOrder, setSortOrder] = useState(filters.sort_order || 'asc');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(15);
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
    const getTruncationLength = (type: 'name' | 'address' | 'contact' | 'occupation' = 'name'): number => {
        if (typeof window === 'undefined') return 30;
        
        const width = window.innerWidth;
        if (width < 640) { // Mobile
            switch(type) {
                case 'name': return 20;
                case 'address': return 25;
                case 'contact': return 10;
                case 'occupation': return 15;
                default: return 20;
            }
        }
        if (width < 768) { // Tablet
            switch(type) {
                case 'name': return 25;
                case 'address': return 30;
                case 'contact': return 12;
                case 'occupation': return 20;
                default: return 25;
            }
        }
        if (width < 1024) { // Small desktop
            switch(type) {
                case 'name': return 30;
                case 'address': return 35;
                case 'contact': return 15;
                case 'occupation': return 25;
                default: return 30;
            }
        }
        // Large desktop
        switch(type) {
            case 'name': return 35;
            case 'address': return 40;
            case 'contact': return 15;
            case 'occupation': return 30;
            default: return 35;
        }
    };

    // Filter residents client-side
    const filteredResidents = useMemo(() => {
        let result = [...allResidents];

        // Search filter
        if (search) {
            const searchLower = search.toLowerCase();
            result = result.filter(resident => 
                resident.first_name.toLowerCase().includes(searchLower) ||
                resident.last_name.toLowerCase().includes(searchLower) ||
                (resident.middle_name && resident.middle_name.toLowerCase().includes(searchLower)) ||
                (resident.contact_number && resident.contact_number.includes(search)) ||
                resident.address.toLowerCase().includes(searchLower) ||
                (resident.occupation && resident.occupation.toLowerCase().includes(searchLower)) ||
                (resident.educational_attainment && resident.educational_attainment.toLowerCase().includes(searchLower)) ||
                (resident.purok && resident.purok.name.toLowerCase().includes(searchLower)) ||
                (resident.household_memberships && resident.household_memberships.some(membership => 
                    membership.household && 
                    membership.household.household_number.toLowerCase().includes(searchLower)
                ))
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            result = result.filter(resident => resident.status === statusFilter);
        }

        // Purok filter
        if (purokFilter !== 'all') {
            const purokId = parseInt(purokFilter);
            result = result.filter(resident => resident.purok_id === purokId);
        }

        // Gender filter
        if (genderFilter !== 'all') {
            result = result.filter(resident => resident.gender === genderFilter);
        }

        // Age range filter
        if (minAgeFilter) {
            const minAge = parseInt(minAgeFilter);
            result = result.filter(resident => resident.age >= minAge);
        }
        if (maxAgeFilter) {
            const maxAge = parseInt(maxAgeFilter);
            result = result.filter(resident => resident.age <= maxAge);
        }

        // Civil status filter
        if (civilStatusFilter !== 'all') {
            result = result.filter(resident => resident.civil_status === civilStatusFilter);
        }

        // Boolean filters
        if (voterFilter !== 'all') {
            const isVoter = voterFilter === '1';
            result = result.filter(resident => resident.is_voter === isVoter);
        }
        
        // Head of household filter
        if (headFilter !== 'all') {
            const isHead = headFilter === '1';
            result = result.filter(resident => isHeadOfHousehold(resident) === isHead);
        }

        // Sorting
        result.sort((a, b) => {
            let aValue: any, bValue: any;
            
            switch (sortBy) {
                case 'last_name':
                    aValue = a.last_name.toLowerCase();
                    bValue = b.last_name.toLowerCase();
                    break;
                case 'first_name':
                    aValue = a.first_name.toLowerCase();
                    bValue = b.first_name.toLowerCase();
                    break;
                case 'age':
                    aValue = a.age;
                    bValue = b.age;
                    break;
                case 'created_at':
                    aValue = new Date(a.created_at).getTime();
                    bValue = new Date(b.created_at).getTime();
                    break;
                case 'purok_id':
                    aValue = a.purok?.name || '';
                    bValue = b.purok?.name || '';
                    break;
                case 'status':
                    aValue = a.status;
                    bValue = b.status;
                    break;
                case 'household':
                    const aHousehold = getHouseholdInfo(a);
                    const bHousehold = getHouseholdInfo(b);
                    aValue = aHousehold?.household_number || '';
                    bValue = bHousehold?.household_number || '';
                    break;
                default:
                    aValue = a.last_name.toLowerCase();
                    bValue = b.last_name.toLowerCase();
            }

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
            } else {
                return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
            }
        });

        return result;
    }, [
        allResidents, search, statusFilter, purokFilter, genderFilter, 
        minAgeFilter, maxAgeFilter, civilStatusFilter, voterFilter, 
        headFilter, sortBy, sortOrder
    ]);

    // Calculate pagination
    const totalItems = filteredResidents.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedResidents = filteredResidents.slice(startIndex, endIndex);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [search, statusFilter, purokFilter, genderFilter, minAgeFilter, maxAgeFilter, 
        civilStatusFilter, voterFilter, headFilter, sortBy, sortOrder]);

    const handleSort = (column: string) => {
        const newSortOrder = sortBy === column && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortBy(column);
        setSortOrder(newSortOrder);
    };

    const handleClearFilters = () => {
        setSearch('');
        setStatusFilter('all');
        setPurokFilter('all');
        setGenderFilter('all');
        setMinAgeFilter('');
        setMaxAgeFilter('');
        setCivilStatusFilter('all');
        setVoterFilter('all');
        setHeadFilter('all');
        setSortBy('last_name');
        setSortOrder('asc');
    };

    const handleAgeRangeSelect = (range: { min: number, max: number }) => {
        setMinAgeFilter(range.min.toString());
        setMaxAgeFilter(range.max.toString());
    };

    const handleDelete = (resident: Resident) => {
        if (confirm(`Are you sure you want to delete resident ${resident.first_name} ${resident.last_name}?`)) {
            router.delete(`/residents/${resident.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    // Success message or refresh
                }
            });
        }
    };

    const handleCopyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text).then(() => {
            console.log(`Copied ${label} to clipboard:`, text);
        });
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getFullName = (resident: Resident) => {
        if (resident.full_name) return resident.full_name;

        let name = `${resident.first_name}`;
        if (resident.middle_name) {
            name += ` ${resident.middle_name.charAt(0)}.`;
        }
        name += ` ${resident.last_name}`;
        return name;
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active': return 'default';
            case 'inactive':
            case 'deceased':
                return 'secondary';
            default: return 'outline';
        }
    };

    const getStatusLabel = (status: string) => {
        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    const getSortIcon = (column: string) => {
        if (sortBy !== column) return null;
        return sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
    };

    const hasActiveFilters = 
        search || 
        statusFilter !== 'all' || 
        purokFilter !== 'all' || 
        genderFilter !== 'all' ||
        minAgeFilter ||
        maxAgeFilter ||
        civilStatusFilter !== 'all' ||
        voterFilter !== 'all' ||
        headFilter !== 'all';

    // Get recent residents (first 3 from current page)
    const recentResidents = paginatedResidents.slice(0, 3);

    // Default age ranges if not provided
    const defaultAgeRanges = [
        { label: 'Children (0-12)', min: 0, max: 12 },
        { label: 'Teens (13-19)', min: 13, max: 19 },
        { label: 'Young Adults (20-35)', min: 20, max: 35 },
        { label: 'Adults (36-59)', min: 36, max: 59 },
        { label: 'Seniors (60+)', min: 60, max: 150 },
    ];

    const displayAgeRanges = ageRanges.length > 0 ? ageRanges : defaultAgeRanges;

    // Calculate filtered stats
    const filteredStats = useMemo(() => {
        const activeCount = filteredResidents.filter(r => r.status === 'active').length;
        const maleCount = filteredResidents.filter(r => r.gender === 'male').length;
        const femaleCount = filteredResidents.filter(r => r.gender === 'female').length;
        const otherCount = filteredResidents.filter(r => r.gender === 'other').length;
        const voterCount = filteredResidents.filter(r => r.is_voter).length;
        const seniorCount = filteredResidents.filter(r => r.age >= 60).length;
        const pwdCount = filteredResidents.filter(r => r.is_pwd).length;
        const headCount = filteredResidents.filter(r => isHeadOfHousehold(r)).length;
        const avgAge = filteredResidents.length > 0 
            ? (filteredResidents.reduce((sum, r) => sum + r.age, 0) / filteredResidents.length).toFixed(1)
            : '0.0';

        return {
            total: filteredResidents.length,
            active: activeCount,
            newThisMonth: stats.newThisMonth,
            totalHouseholds: stats.totalHouseholds,
            avgAge: parseFloat(avgAge),
            maleCount,
            femaleCount,
            otherCount,
            voterCount,
            seniorCount,
            pwdCount,
            headCount,
        };
    }, [filteredResidents, stats.newThisMonth, stats.totalHouseholds]);

    // Function to view photo
    const viewPhoto = (resident: Resident) => {
        const photoUrl = getPhotoUrl(resident.photo_path, resident.photo_url);
        if (photoUrl) {
            window.open(photoUrl, '_blank');
        }
    };

    return (
        <AppLayout
            title="Residents"
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Residents', href: '/residents' }
            ]}
        >
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Resident Management</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                            Manage resident profiles and information
                        </p>
                    </div>
                    <Link href="/residents/create">
                        <Button className="h-9">
                            <Plus className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Add Resident</span>
                            <span className="sm:hidden">Add</span>
                        </Button>
                    </Link>
                </div>

                {/* Stats Cards - Enhanced */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card className="overflow-hidden">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">
                                Total Residents
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold">{filteredStats.total.toLocaleString()}</div>
                            <div className="text-xs sm:text-sm text-gray-500 mt-1">
                                {filteredStats.maleCount} M • {filteredStats.femaleCount} F
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="overflow-hidden">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">
                                Active
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold">{filteredStats.active.toLocaleString()}</div>
                            <div className="text-xs sm:text-sm text-gray-500 mt-1">
                                {filteredStats.voterCount} voters • {filteredStats.seniorCount} seniors
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="overflow-hidden">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">
                                New This Month
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold text-green-600">+{stats.newThisMonth}</div>
                            <div className="text-xs sm:text-sm text-gray-500 mt-1">
                                Avg. Age: {filteredStats.avgAge}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="overflow-hidden">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">
                                Special Groups
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold">{filteredStats.pwdCount}</div>
                            <div className="text-xs sm:text-sm text-gray-500 mt-1">
                                PWDs • {filteredStats.headCount} Heads
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search and Filters */}
                <Card className="overflow-hidden">
                    <CardContent className="pt-6">
                        <div className="flex flex-col space-y-4">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <Input
                                        placeholder="Search residents by name, contact, address, occupation..."
                                        className="pl-10"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button 
                                        variant="outline" 
                                        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                        className="h-9"
                                    >
                                        <Filter className="h-4 w-4 mr-2" />
                                        <span className="hidden sm:inline">
                                            {showAdvancedFilters ? 'Hide Filters' : 'More Filters'}
                                        </span>
                                        <span className="sm:hidden">
                                            {showAdvancedFilters ? 'Hide' : 'Filters'}
                                        </span>
                                    </Button>
                                    <Button 
                                        variant="outline"
                                        className="h-9"
                                        onClick={() => {
                                            const exportUrl = new URL('/residents/export', window.location.origin);
                                            if (search) exportUrl.searchParams.append('search', search);
                                            if (statusFilter !== 'all') exportUrl.searchParams.append('status', statusFilter);
                                            if (purokFilter !== 'all') exportUrl.searchParams.append('purok_id', purokFilter);
                                            window.open(exportUrl.toString(), '_blank');
                                        }}
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        <span className="hidden sm:inline">Export</span>
                                    </Button>
                                </div>
                            </div>

                            {/* Basic Filters */}
                            <div className="flex flex-wrap gap-2 sm:gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500 hidden sm:inline">Status:</span>
                                    <select
                                        className="border rounded px-2 py-1 text-sm w-28 sm:w-auto"
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                    >
                                        <option value="all">All Status</option>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="deceased">Deceased</option>
                                    </select>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500 hidden sm:inline">Purok:</span>
                                    <select
                                        className="border rounded px-2 py-1 text-sm w-28 sm:w-auto"
                                        value={purokFilter}
                                        onChange={(e) => setPurokFilter(e.target.value)}
                                    >
                                        <option value="all">All Puroks</option>
                                        {puroks.map((purok) => (
                                            <option key={purok.id} value={purok.id}>{purok.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500 hidden sm:inline">Gender:</span>
                                    <select
                                        className="border rounded px-2 py-1 text-sm w-28 sm:w-auto"
                                        value={genderFilter}
                                        onChange={(e) => setGenderFilter(e.target.value)}
                                    >
                                        <option value="all">All</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500 hidden sm:inline">Head:</span>
                                    <select
                                        className="border rounded px-2 py-1 text-sm w-28 sm:w-auto"
                                        value={headFilter}
                                        onChange={(e) => setHeadFilter(e.target.value)}
                                    >
                                        <option value="all">All Heads</option>
                                        <option value="1">Head of Family</option>
                                        <option value="0">Not Head</option>
                                    </select>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500 hidden sm:inline">Sort:</span>
                                    <select
                                        className="border rounded px-2 py-1 text-sm w-28 sm:w-auto"
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                    >
                                        <option value="last_name">Last Name</option>
                                        <option value="first_name">First Name</option>
                                        <option value="age">Age</option>
                                        <option value="created_at">Date Added</option>
                                        <option value="purok_id">Purok</option>
                                        <option value="household">Household</option>
                                        <option value="status">Status</option>
                                    </select>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 w-7 p-0"
                                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                    >
                                        {sortOrder === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                    </Button>
                                </div>
                            </div>

                            {/* Advanced Filters */}
                            {showAdvancedFilters && (
                                <div className="border-t pt-4 space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {/* Age Filter */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Age Range</label>
                                            <div className="flex gap-2">
                                                <Input
                                                    placeholder="Min age"
                                                    type="number"
                                                    className="w-24"
                                                    value={minAgeFilter}
                                                    onChange={(e) => setMinAgeFilter(e.target.value)}
                                                />
                                                <span className="self-center text-sm">to</span>
                                                <Input
                                                    placeholder="Max age"
                                                    type="number"
                                                    className="w-24"
                                                    value={maxAgeFilter}
                                                    onChange={(e) => setMaxAgeFilter(e.target.value)}
                                                />
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                {displayAgeRanges.map((range, index) => (
                                                    <Badge
                                                        key={index}
                                                        variant="outline"
                                                        className="cursor-pointer hover:bg-gray-100 text-xs"
                                                        onClick={() => handleAgeRangeSelect(range)}
                                                    >
                                                        {windowWidth < 640 ? range.label.split(' ')[0] : range.label}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Civil Status */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Civil Status</label>
                                            <select
                                                className="w-full border rounded px-2 py-1 text-sm"
                                                value={civilStatusFilter}
                                                onChange={(e) => setCivilStatusFilter(e.target.value)}
                                            >
                                                <option value="all">All Status</option>
                                                {civilStatusOptions.map((status) => (
                                                    <option key={status} value={status}>
                                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Boolean Filters */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Special Filters</label>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                <div>
                                                    <select
                                                        className="w-full border rounded px-2 py-1 text-sm"
                                                        value={voterFilter}
                                                        onChange={(e) => setVoterFilter(e.target.value)}
                                                    >
                                                        <option value="all">All Voters</option>
                                                        <option value="1">Registered Voter</option>
                                                        <option value="0">Not a Voter</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <select
                                                        className="w-full border rounded px-2 py-1 text-sm"
                                                        value={headFilter}
                                                        onChange={(e) => setHeadFilter(e.target.value)}
                                                    >
                                                        <option value="all">All Heads</option>
                                                        <option value="1">Head of Family</option>
                                                        <option value="0">Not Head</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Active filters indicator and clear button */}
                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                <div className="text-sm text-gray-500">
                                    Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} residents
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

                {/* Residents Table */}
                <Card className="overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <CardTitle className="text-lg sm:text-xl">Resident List</CardTitle>
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
                                                <TableHead 
                                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[160px] cursor-pointer hover:bg-gray-100"
                                                    onClick={() => handleSort('last_name')}
                                                >
                                                    <div className="flex items-center gap-1">
                                                        Name
                                                        {getSortIcon('last_name')}
                                                    </div>
                                                </TableHead>
                                                <TableHead 
                                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px] cursor-pointer hover:bg-gray-100"
                                                    onClick={() => handleSort('age')}
                                                >
                                                    <div className="flex items-center gap-1">
                                                        Age/Gender
                                                        {getSortIcon('age')}
                                                    </div>
                                                </TableHead>
                                                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                                                    Contact
                                                </TableHead>
                                                <TableHead 
                                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[180px] cursor-pointer hover:bg-gray-100"
                                                    onClick={() => handleSort('purok_id')}
                                                >
                                                    <div className="flex items-center gap-1">
                                                        Address/Purok
                                                        {getSortIcon('purok_id')}
                                                    </div>
                                                </TableHead>
                                                <TableHead 
                                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px] cursor-pointer hover:bg-gray-100"
                                                    onClick={() => handleSort('household')}
                                                >
                                                    <div className="flex items-center gap-1">
                                                        Household
                                                        {getSortIcon('household')}
                                                    </div>
                                                </TableHead>
                                                <TableHead 
                                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px] cursor-pointer hover:bg-gray-100"
                                                    onClick={() => handleSort('status')}
                                                >
                                                    <div className="flex items-center gap-1">
                                                        Status
                                                        {getSortIcon('status')}
                                                    </div>
                                                </TableHead>
                                                <TableHead className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50 dark:bg-gray-800 min-w-[80px]">
                                                    Actions
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {paginatedResidents.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                                        No residents found. {hasActiveFilters && 'Try changing your filters.'}
                                                        {!hasActiveFilters && (
                                                            <div className="mt-2">
                                                                <Link href="/residents/create">
                                                                    <Button size="sm" className="h-8">
                                                                        <Plus className="h-3 w-3 mr-1" />
                                                                        Add First Resident
                                                                    </Button>
                                                                </Link>
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                paginatedResidents.map((resident) => {
                                                    const fullName = getFullName(resident);
                                                    const nameLength = getTruncationLength('name');
                                                    const addressLength = getTruncationLength('address');
                                                    const contactLength = getTruncationLength('contact');
                                                    const photoUrl = getPhotoUrl(resident.photo_path, resident.photo_url);
                                                    const hasPhoto = !!photoUrl;
                                                    const householdInfo = getHouseholdInfo(resident);
                                                    const isHead = isHeadOfHousehold(resident);
                                                    
                                                    return (
                                                        <TableRow key={resident.id}>
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
                                                                    title={`Double-click to select all\n${fullName}`}
                                                                >
                                                                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                                        {hasPhoto ? (
                                                                            <img 
                                                                                src={photoUrl} 
                                                                                alt={fullName}
                                                                                className="h-full w-full object-cover"
                                                                                onError={(e) => {
                                                                                    e.currentTarget.style.display = 'none';
                                                                                    const parent = e.currentTarget.parentElement;
                                                                                    if (parent) {
                                                                                        parent.innerHTML = '<svg class="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>';
                                                                                    }
                                                                                }}
                                                                            />
                                                                        ) : (
                                                                            <User className="h-4 w-4 text-gray-600" />
                                                                        )}
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <div 
                                                                            className="font-medium truncate flex items-center gap-1"
                                                                            data-full-text={fullName}
                                                                        >
                                                                            {truncateText(fullName, nameLength)}
                                                                            {isHead && (
                                                                                <Crown className="h-3 w-3 text-amber-600" />
                                                                            )}
                                                                        </div>
                                                                        <div className="flex items-center gap-2 mt-1">
                                                                            <div className="text-xs text-gray-500">
                                                                                ID: {resident.id}
                                                                            </div>
                                                                            {hasPhoto && (
                                                                                <Badge variant="outline" className="text-xs">
                                                                                    <Camera className="h-2.5 w-2.5 mr-1" />
                                                                                    Photo
                                                                                </Badge>
                                                                            )}
                                                                            {isHead && (
                                                                                <Badge variant="outline" className="text-xs bg-amber-50">
                                                                                    <Crown className="h-2.5 w-2.5 mr-1" />
                                                                                    Head
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="px-4 py-3">
                                                                <div>
                                                                    <div>{resident.age} years</div>
                                                                    <div className="text-sm text-gray-500 capitalize truncate">
                                                                        {resident.gender}
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="px-4 py-3">
                                                                <div 
                                                                    className="flex items-center gap-1 cursor-text select-text"
                                                                    onDoubleClick={(e) => {
                                                                        const selection = window.getSelection();
                                                                        if (selection) {
                                                                            const range = document.createRange();
                                                                            range.selectNodeContents(e.currentTarget);
                                                                            selection.removeAllRanges();
                                                                            selection.addRange(range);
                                                                        }
                                                                    }}
                                                                    title={`Double-click to select all\n${resident.contact_number || 'N/A'}`}
                                                                >
                                                                    <Phone className="h-3 w-3 text-gray-500 flex-shrink-0" />
                                                                    <div 
                                                                        className="truncate"
                                                                        data-full-text={resident.contact_number}
                                                                    >
                                                                        {formatContactNumber(resident.contact_number)}
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="px-4 py-3">
                                                                <div 
                                                                    className="flex items-center gap-1 cursor-text select-text"
                                                                    onDoubleClick={(e) => {
                                                                        const selection = window.getSelection();
                                                                        if (selection) {
                                                                            const range = document.createRange();
                                                                            range.selectNodeContents(e.currentTarget);
                                                                            selection.removeAllRanges();
                                                                            selection.addRange(range);
                                                                        }
                                                                    }}
                                                                    title={`Double-click to select all\nAddress: ${resident.address}\nPurok: ${resident.purok?.name || 'No Purok'}`}
                                                                >
                                                                    <Home className="h-3 w-3 text-gray-500 flex-shrink-0" />
                                                                    <div className="min-w-0">
                                                                        <div 
                                                                            className="truncate"
                                                                            data-full-text={resident.address}
                                                                        >
                                                                            {truncateAddress(resident.address, addressLength)}
                                                                        </div>
                                                                        <div className="text-xs text-gray-500 truncate">
                                                                            {resident.purok ? resident.purok.name : 'No Purok'}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="px-4 py-3">
                                                                {householdInfo ? (
                                                                    <Link href={`/households/${householdInfo.id}`} className="hover:text-primary hover:underline">
                                                                        <div 
                                                                            className="font-medium truncate flex items-center gap-1"
                                                                            title={householdInfo.household_number}
                                                                        >
                                                                            {truncateText(householdInfo.household_number, 15)}
                                                                            {householdInfo.is_head && (
                                                                                <Crown className="h-3 w-3 text-amber-600" />
                                                                            )}
                                                                        </div>
                                                                        <div 
                                                                            className="text-sm text-gray-500 truncate"
                                                                            title={`${householdInfo.head_of_family} (${householdInfo.relationship_to_head})`}
                                                                        >
                                                                            {truncateText(householdInfo.head_of_family, 15)}
                                                                        </div>
                                                                        <div className="text-xs text-gray-400 truncate">
                                                                            {householdInfo.relationship_to_head}
                                                                        </div>
                                                                    </Link>
                                                                ) : (
                                                                    <span className="text-gray-400 italic text-sm">No household</span>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="px-4 py-3">
                                                                <Badge 
                                                                    variant={getStatusBadgeVariant(resident.status)}
                                                                    className="truncate max-w-full"
                                                                    title={getStatusLabel(resident.status)}
                                                                >
                                                                    {getStatusLabel(resident.status)}
                                                                </Badge>
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
                                                                            <Link href={`/residents/${resident.id}`} className="flex items-center cursor-pointer">
                                                                                <Eye className="mr-2 h-4 w-4" />
                                                                                <span>View Details</span>
                                                                            </Link>
                                                                        </DropdownMenuItem>
                                                                        
                                                                        <DropdownMenuItem asChild>
                                                                            <Link href={`/residents/${resident.id}/edit`} className="flex items-center cursor-pointer">
                                                                                <Edit className="mr-2 h-4 w-4" />
                                                                                <span>Edit Profile</span>
                                                                            </Link>
                                                                        </DropdownMenuItem>

                                                                        {hasPhoto && (
                                                                            <DropdownMenuItem 
                                                                                onClick={() => viewPhoto(resident)}
                                                                                className="flex items-center cursor-pointer"
                                                                            >
                                                                                <Camera className="mr-2 h-4 w-4" />
                                                                                <span>View Photo</span>
                                                                            </DropdownMenuItem>
                                                                        )}
                                                                        
                                                                        <DropdownMenuSeparator />
                                                                        
                                                                        <DropdownMenuItem 
                                                                            onClick={() => handleCopyToClipboard(fullName, 'Name')}
                                                                            className="flex items-center cursor-pointer"
                                                                        >
                                                                            <Clipboard className="mr-2 h-4 w-4" />
                                                                            <span>Copy Name</span>
                                                                        </DropdownMenuItem>
                                                                        
                                                                        {resident.contact_number && (
                                                                            <DropdownMenuItem 
                                                                                onClick={() => handleCopyToClipboard(resident.contact_number, 'Contact')}
                                                                                className="flex items-center cursor-pointer"
                                                                            >
                                                                                <Clipboard className="mr-2 h-4 w-4" />
                                                                                <span>Copy Contact</span>
                                                                            </DropdownMenuItem>
                                                                        )}
                                                                        
                                                                        <DropdownMenuItem asChild>
                                                                            <Link href={`/residents/${resident.id}/generate-id`} className="flex items-center cursor-pointer">
                                                                                <QrCode className="mr-2 h-4 w-4" />
                                                                                <span>Generate ID</span>
                                                                            </Link>
                                                                        </DropdownMenuItem>
                                                                        
                                                                        <DropdownMenuItem asChild>
                                                                            <Link href={`/clearances/create?resident_id=${resident.id}`} className="flex items-center cursor-pointer">
                                                                                <FileText className="mr-2 h-4 w-4" />
                                                                                <span>Create Clearance</span>
                                                                            </Link>
                                                                        </DropdownMenuItem>
                                                                        
                                                                        <DropdownMenuSeparator />
                                                                        
                                                                        {resident.status !== 'deceased' && (
                                                                            <DropdownMenuItem 
                                                                                className="text-red-600 focus:text-red-700 focus:bg-red-50"
                                                                                onClick={() => handleDelete(resident)}
                                                                            >
                                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                                <span>Delete Resident</span>
                                                                            </DropdownMenuItem>
                                                                        )}
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
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Additional Information - Updated */}
                <div className="grid gap-6 sm:grid-cols-2">
                    <Card className="overflow-hidden">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Recent Registrations</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {recentResidents.length === 0 ? (
                                <p className="text-gray-500 text-center py-4 text-sm">No recent registrations</p>
                            ) : (
                                <div className="space-y-3">
                                    {recentResidents.map((resident) => {
                                        const fullName = getFullName(resident);
                                        const nameLength = getTruncationLength('name');
                                        const photoUrl = getPhotoUrl(resident.photo_path, resident.photo_url);
                                        const hasPhoto = !!photoUrl;
                                        const isHead = isHeadOfHousehold(resident);
                                        
                                        return (
                                            <div key={resident.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                        {hasPhoto ? (
                                                            <img 
                                                                src={photoUrl} 
                                                                alt={fullName}
                                                                className="h-full w-full object-cover"
                                                                onError={(e) => {
                                                                    e.currentTarget.style.display = 'none';
                                                                    const parent = e.currentTarget.parentElement;
                                                                    if (parent) {
                                                                        parent.innerHTML = '<svg class="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>';
                                                                    }
                                                                }}
                                                            />
                                                        ) : (
                                                            <User className="h-5 w-5 text-gray-600" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p 
                                                            className="font-medium truncate flex items-center gap-1"
                                                            title={fullName}
                                                        >
                                                            {truncateText(fullName, nameLength)}
                                                            {isHead && <Crown className="h-3 w-3 text-amber-600" />}
                                                        </p>
                                                        <p className="text-sm text-gray-500 truncate">
                                                            {formatDate(resident.created_at)} • {resident.age}y • {resident.gender}
                                                        </p>
                                                        {resident.purok && (
                                                            <p className="text-xs text-gray-400 truncate">
                                                                {resident.purok.name}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {hasPhoto && (
                                                        <Badge variant="outline" className="text-xs">
                                                            <Camera className="h-2.5 w-2.5 mr-1" />
                                                        </Badge>
                                                    )}
                                                    {isHead && (
                                                        <Badge variant="outline" className="text-xs bg-amber-50">
                                                            <Crown className="h-2.5 w-2.5 mr-1" />
                                                            Head
                                                        </Badge>
                                                    )}
                                                    <Badge variant="outline" className="ml-2 flex-shrink-0">New</Badge>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {recentResidents.length < paginatedResidents.length && (
                                        <div className="text-center pt-2">
                                            <Button 
                                                variant="ghost" 
                                                size="sm"
                                                onClick={() => setCurrentPage(1)}
                                                className="h-8"
                                            >
                                                View All Residents
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Filter Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="text-sm text-gray-500">
                                    Current filters applied:
                                </div>
                                {hasActiveFilters ? (
                                    <div className="space-y-2">
                                        {search && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm truncate max-w-[120px]">Search:</span>
                                                <Badge variant="outline" className="truncate max-w-[150px]" title={search}>
                                                    {truncateText(search, 20)}
                                                </Badge>
                                            </div>
                                        )}
                                        {statusFilter !== 'all' && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">Status:</span>
                                                <Badge variant="outline">{statusFilter}</Badge>
                                            </div>
                                        )}
                                        {purokFilter !== 'all' && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">Purok:</span>
                                                <Badge variant="outline" className="truncate max-w-[120px]" title={puroks.find(p => p.id.toString() === purokFilter)?.name || purokFilter}>
                                                    {truncateText(puroks.find(p => p.id.toString() === purokFilter)?.name || purokFilter, 15)}
                                                </Badge>
                                            </div>
                                        )}
                                        {genderFilter !== 'all' && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">Gender:</span>
                                                <Badge variant="outline">{genderFilter}</Badge>
                                            </div>
                                        )}
                                        {(minAgeFilter || maxAgeFilter) && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">Age Range:</span>
                                                <Badge variant="outline">
                                                    {minAgeFilter || '0'} - {maxAgeFilter || '∞'}
                                                </Badge>
                                            </div>
                                        )}
                                        {civilStatusFilter !== 'all' && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">Civil Status:</span>
                                                <Badge variant="outline" className="truncate max-w-[120px]" title={civilStatusFilter}>
                                                    {truncateText(civilStatusFilter, 15)}
                                                </Badge>
                                            </div>
                                        )}
                                        {headFilter !== 'all' && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">Head Status:</span>
                                                <Badge variant="outline">{headFilter === '1' ? 'Head of Family' : 'Not Head'}</Badge>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-center py-2 text-sm">No filters applied</p>
                                )}
                                
                                <div className="pt-4 border-t">
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="w-full h-8"
                                        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                    >
                                        {showAdvancedFilters ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}