import AppLayout from '@/layouts/admin-app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
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
    Crown,
    Layers,
    MousePointer,
    FilterX,
    Rows,
    RotateCcw,
    Hash,
    PackageCheck,
    PackageX,
    ClipboardCopy,
    KeyRound,
    Check,
    X,
    ChevronLeft,
    ChevronRight,
    Loader2,
    ArrowUpDown,
    Mail,
    CheckCheck,
    Ban,
    Archive,
    Send,
    ExternalLink,
    BarChart3,
    AlertTriangle,
    Users,
    Shield,
    Globe,
    FileSpreadsheet,
    Printer,
    Zap,
    RefreshCw,
    CheckCircle,
    XCircle,
    Clock,
    DollarSign,
    Grid3X3,
    List,
    Settings,
    EyeOff,
    MoreHorizontal,
    FileEdit,
    FileUp,
    Type,
    PlusCircle,
    MinusCircle,
    Save,
    Upload,
    Sheet,
    Tags,
    Tag,
    CalendarDays,
    MoveHorizontal,
    Timer,
    PlayCircle,
    PauseCircle,
    Square,
    CheckSquare,
    CopyCheck
} from 'lucide-react';
import { Link, usePage, router } from '@inertiajs/react';
import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import debounce from 'lodash/debounce';
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

// Bulk operation types
type BulkOperation = 'export' | 'print' | 'delete' | 'update_status' | 'update_purok' | 'mark_voter' | 'mark_pwd' | 'add_to_household' | 'generate_ids' | 'send_message' | 'export_csv' | 'export_pdf';

// Bulk edit field types
type BulkEditField = 'status' | 'purok_id' | 'is_voter' | 'is_pwd' | 'civil_status';

declare module '@inertiajs/react' {
    interface PageProps {
        residents: ResidentsProps['residents'];
        stats: ResidentsProps['stats'];
        filters: ResidentsProps['filters'];
        puroks: ResidentsProps['puroks'];
        civilStatusOptions: ResidentsProps['civilStatusOptions'];
        ageRanges: ResidentsProps['ageRanges'];
        allResidents: ResidentsProps['allResidents'];
    }
}

// Safe number conversion helper
const safeNumber = (value: any, defaultValue: number = 0): number => {
    if (value === null || value === undefined || value === '') return defaultValue;
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
};

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

export default function Residents() {
    const { props } = usePage<ResidentsProps>();
    const { residents, stats, filters, puroks, civilStatusOptions = [], ageRanges = [], allResidents } = props;
    
    // Initialize state
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
    
    // Bulk selection states
    const [selectedResidents, setSelectedResidents] = useState<number[]>([]);
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [showBulkActions, setShowBulkActions] = useState(false);
    const [isSelectAll, setIsSelectAll] = useState(false);
    const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
    const [showBulkStatusDialog, setShowBulkStatusDialog] = useState(false);
    const [showBulkPurokDialog, setShowBulkPurokDialog] = useState(false);
    const [isPerformingBulkAction, setIsPerformingBulkAction] = useState(false);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const [bulkEditField, setBulkEditField] = useState<BulkEditField>('status');
    const [bulkEditValue, setBulkEditValue] = useState<string>('');
    const [selectionMode, setSelectionMode] = useState<'page' | 'filtered' | 'all'>('page');
    const [showSelectionOptions, setShowSelectionOptions] = useState(false);
    
    const bulkActionRef = useRef<HTMLDivElement>(null);
    const selectionRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Track window resize
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (bulkActionRef.current && !bulkActionRef.current.contains(event.target as Node)) {
                setShowBulkActions(false);
            }
            if (selectionRef.current && !selectionRef.current.contains(event.target as Node)) {
                setShowSelectionOptions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Debounced search
    const debouncedSearch = useCallback(
        debounce((value: string) => {
            const params: any = {};
            if (value) params.search = value;
            if (statusFilter !== 'all') params.status = statusFilter;
            if (purokFilter !== 'all') params.purok_id = purokFilter;
            if (genderFilter !== 'all') params.gender = genderFilter;
            if (minAgeFilter) params.min_age = minAgeFilter;
            if (maxAgeFilter) params.max_age = maxAgeFilter;
            if (civilStatusFilter !== 'all') params.civil_status = civilStatusFilter;
            if (voterFilter !== 'all') params.is_voter = voterFilter;
            if (headFilter !== 'all') params.is_head = headFilter;
            if (sortBy !== 'last_name') params.sort_by = sortBy;
            if (sortOrder !== 'asc') params.sort_order = sortOrder;
            
            router.get('/residents', params, {
                preserveState: true,
                replace: true,
                preserveScroll: true,
            });
        }, 500),
        [statusFilter, purokFilter, genderFilter, minAgeFilter, maxAgeFilter, civilStatusFilter, voterFilter, headFilter, sortBy, sortOrder]
    );

    // Handle search term change
    useEffect(() => {
        if (search !== filters.search) {
            debouncedSearch(search);
        }
        return () => debouncedSearch.cancel();
    }, [search, debouncedSearch]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ctrl/Cmd + A to select all on current page
            if ((e.ctrlKey || e.metaKey) && e.key === 'a' && isBulkMode) {
                e.preventDefault();
                if (e.shiftKey) {
                    handleSelectAllFiltered();
                } else {
                    handleSelectAllOnPage();
                }
            }
            // Escape to exit bulk mode or clear selection
            if (e.key === 'Escape') {
                if (isBulkMode) {
                    if (selectedResidents.length > 0) {
                        setSelectedResidents([]);
                    } else {
                        setIsBulkMode(false);
                    }
                }
                if (showBulkActions) setShowBulkActions(false);
                if (showSelectionOptions) setShowSelectionOptions(false);
            }
            // Ctrl/Cmd + Shift + B to toggle bulk mode
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'B') {
                e.preventDefault();
                setIsBulkMode(!isBulkMode);
            }
            // Ctrl/Cmd + F to focus search
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
            // Delete key to open delete dialog
            if (e.key === 'Delete' && isBulkMode && selectedResidents.length > 0) {
                e.preventDefault();
                setShowBulkDeleteDialog(true);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isBulkMode, selectedResidents, showBulkActions, showSelectionOptions]);

    // Reset selection when bulk mode is turned off or filters change
    useEffect(() => {
        if (!isBulkMode) {
            setSelectedResidents([]);
            setIsSelectAll(false);
        }
    }, [isBulkMode]);

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

    // Handle select/deselect all on current page
    const handleSelectAllOnPage = () => {
        const pageIds = paginatedResidents.map(resident => resident.id);
        if (isSelectAll) {
            setSelectedResidents(prev => prev.filter(id => !pageIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedResidents, ...pageIds])];
            setSelectedResidents(newSelected);
        }
        setIsSelectAll(!isSelectAll);
        setSelectionMode('page');
    };

    // Handle select/deselect all filtered items (client-side filtered)
    const handleSelectAllFiltered = () => {
        const allIds = filteredResidents.map(resident => resident.id);
        if (selectedResidents.length === allIds.length && allIds.every(id => selectedResidents.includes(id))) {
            setSelectedResidents(prev => prev.filter(id => !allIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedResidents, ...allIds])];
            setSelectedResidents(newSelected);
            setSelectionMode('filtered');
        }
    };

    // Handle select all items (including not loaded)
    const handleSelectAll = () => {
        if (confirm(`This will select ALL ${residents.total} residents. This action may take a moment.`)) {
            // For now, just select all on current page
            // In production, you'd make an API call to get all IDs
            const pageIds = paginatedResidents.map(resident => resident.id);
            setSelectedResidents(pageIds);
            setSelectionMode('all');
            toast.info('Selected all items on current page. For full selection, implement server-side API.');
        }
    };

    // Handle individual item selection
    const handleItemSelect = (id: number) => {
        setSelectedResidents(prev => {
            if (prev.includes(id)) {
                return prev.filter(itemId => itemId !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    // Check if all items on current page are selected
    useEffect(() => {
        const allPageIds = paginatedResidents.map(resident => resident.id);
        const allSelected = allPageIds.every(id => selectedResidents.includes(id));
        setIsSelectAll(allSelected);
    }, [selectedResidents, paginatedResidents]);

    // Get selected residents data
    const selectedResidentsData = useMemo(() => {
        return filteredResidents.filter(resident => selectedResidents.includes(resident.id));
    }, [selectedResidents, filteredResidents]);

    // Calculate selection stats
    const selectionStats = useMemo(() => {
        const selectedData = selectedResidentsData;
        
        const avgAge = selectedData.length > 0 
            ? selectedData.reduce((sum, r) => sum + safeNumber(r.age, 0), 0) / selectedData.length
            : 0;
        
        return {
            total: selectedData.length,
            active: selectedData.filter(r => r.status === 'active').length,
            male: selectedData.filter(r => r.gender === 'male').length,
            female: selectedData.filter(r => r.gender === 'female').length,
            other: selectedData.filter(r => r.gender === 'other').length,
            voters: selectedData.filter(r => r.is_voter).length,
            seniors: selectedData.filter(r => safeNumber(r.age, 0) >= 60).length,
            pwds: selectedData.filter(r => r.is_pwd).length,
            heads: selectedData.filter(r => isHeadOfHousehold(r)).length,
            avgAge: avgAge,
            hasPhotos: selectedData.filter(r => getPhotoUrl(r.photo_path, r.photo_url)).length,
        };
    }, [selectedResidentsData]);

    // Enhanced bulk operation handler
    const handleBulkOperation = async (operation: BulkOperation, customData?: any) => {
        if (selectedResidents.length === 0) {
            toast.error('Please select at least one resident');
            return;
        }

        setIsPerformingBulkAction(true);

        try {
            switch (operation) {
                case 'export':
                case 'export_csv':
                    // Export to CSV
                    const exportData = selectedResidentsData.map(resident => ({
                        'ID': resident.id,
                        'First Name': resident.first_name,
                        'Last Name': resident.last_name,
                        'Middle Name': resident.middle_name || '',
                        'Full Name': getFullName(resident),
                        'Age': resident.age,
                        'Gender': resident.gender,
                        'Birth Date': resident.birth_date || '',
                        'Civil Status': resident.civil_status || '',
                        'Contact Number': resident.contact_number || '',
                        'Address': resident.address,
                        'Purok': resident.purok?.name || '',
                        'Occupation': resident.occupation || '',
                        'Educational Attainment': resident.educational_attainment || '',
                        'Status': resident.status,
                        'Is Voter': resident.is_voter ? 'Yes' : 'No',
                        'Is PWD': resident.is_pwd ? 'Yes' : 'No',
                        'Is 4Ps': resident.is_4ps_beneficiary ? 'Yes' : 'No',
                        'Created At': resident.created_at,
                    }));
                    
                    // Convert to CSV
                    const headers = Object.keys(exportData[0]);
                    const csv = [
                        headers.join(','),
                        ...exportData.map(row => 
                            headers.map(header => {
                                const value = row[header as keyof typeof row];
                                return typeof value === 'string' && value.includes(',') 
                                    ? `"${value}"` 
                                    : value;
                            }).join(',')
                        )
                    ].join('\n');
                    
                    // Create and download file
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `residents-export-${new Date().toISOString().split('T')[0]}.csv`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                    
                    toast.success('Export completed successfully');
                    break;

                case 'print':
                    // Open print preview for each selected resident
                    selectedResidents.forEach(id => {
                        window.open(`/residents/${id}/print`, '_blank');
                    });
                    toast.success(`${selectedResidents.length} resident(s) opened for printing`);
                    break;

                case 'delete':
                    if (confirm(`Are you sure you want to delete ${selectedResidents.length} selected resident(s)? This action cannot be undone.`)) {
                        await router.post('/residents/bulk-delete', {
                            ids: selectedResidents
                        }, {
                            preserveScroll: true,
                            onSuccess: () => {
                                toast.success(`${selectedResidents.length} resident(s) deleted successfully`);
                                setSelectedResidents([]);
                                setShowBulkDeleteDialog(false);
                            },
                            onError: (errors) => {
                                toast.error('Failed to delete residents');
                                console.error('Delete errors:', errors);
                            }
                        });
                    }
                    break;

                case 'update_status':
                    await router.post('/residents/bulk-update-status', {
                        ids: selectedResidents,
                        status: bulkEditValue
                    }, {
                        preserveScroll: true,
                        onSuccess: () => {
                            toast.success(`${selectedResidents.length} resident(s) status updated`);
                            setShowBulkStatusDialog(false);
                            setBulkEditValue('');
                            setSelectedResidents([]);
                        },
                        onError: (errors) => {
                            toast.error('Failed to update status');
                            console.error('Status update errors:', errors);
                        }
                    });
                    break;

                case 'update_purok':
                    await router.post('/residents/bulk-update-purok', {
                        ids: selectedResidents,
                        purok_id: bulkEditValue
                    }, {
                        preserveScroll: true,
                        onSuccess: () => {
                            toast.success(`${selectedResidents.length} resident(s) purok updated`);
                            setShowBulkPurokDialog(false);
                            setBulkEditValue('');
                            setSelectedResidents([]);
                        },
                        onError: (errors) => {
                            toast.error('Failed to update purok');
                            console.error('Purok update errors:', errors);
                        }
                    });
                    break;

                case 'generate_ids':
                    // Open ID generation for selected residents
                    const idsParam = selectedResidents.join(',');
                    window.open(`/residents/generate-bulk-ids?ids=${idsParam}`, '_blank');
                    toast.success(`Generating IDs for ${selectedResidents.length} resident(s)`);
                    break;

                case 'send_message':
                    // Open message composition with selected residents
                    const contacts = selectedResidentsData
                        .filter(r => r.contact_number)
                        .map(r => r.contact_number)
                        .join(',');
                    
                    if (contacts) {
                        const smsLink = `sms:${contacts}`;
                        window.location.href = smsLink;
                    } else {
                        toast.error('No contact numbers available for selected residents');
                    }
                    break;

                default:
                    toast.error('Operation not supported');
            }
        } catch (error) {
            console.error('Bulk operation error:', error);
            toast.error('An error occurred during bulk operation');
        } finally {
            setIsPerformingBulkAction(false);
        }
    };

    // Smart bulk action based on selection
    const handleSmartBulkAction = () => {
        if (selectionStats.voters > 0) {
            toast.info('Selected residents include voters. Consider exporting voter list.');
        } else if (selectionStats.seniors > 0) {
            toast.info('Selected residents include seniors. Consider generating senior citizen reports.');
        } else if (selectionStats.pwds > 0) {
            toast.info('Selected residents include PWDs. Consider generating PWD reports.');
        } else {
            handleBulkOperation('export');
        }
    };

    // Copy selected data to clipboard
    const handleCopySelectedData = () => {
        if (selectedResidentsData.length === 0) {
            toast.error('No data to copy');
            return;
        }
        
        const data = selectedResidentsData.map(resident => ({
            Name: getFullName(resident),
            Age: resident.age,
            Gender: resident.gender,
            Contact: resident.contact_number || 'N/A',
            Address: resident.address,
            Status: resident.status,
        }));
        
        const csv = [
            Object.keys(data[0]).join(','),
            ...data.map(row => Object.values(row).join(','))
        ].join('\n');
        
        navigator.clipboard.writeText(csv).then(() => {
            toast.success('Selected data copied to clipboard as CSV');
        }).catch(() => {
            toast.error('Failed to copy to clipboard');
        });
    };

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
            toast.success(`${label} copied to clipboard`);
        }).catch(() => {
            toast.error('Failed to copy to clipboard');
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

    // Default age ranges if not provided
    const defaultAgeRanges = [
        { label: 'Children (0-12)', min: 0, max: 12 },
        { label: 'Teens (13-19)', min: 13, max: 19 },
        { label: 'Young Adults (20-35)', min: 20, max: 35 },
        { label: 'Adults (36-59)', min: 36, max: 59 },
        { label: 'Seniors (60+)', min: 60, max: 150 },
    ];

    const displayAgeRanges = ageRanges.length > 0 ? ageRanges : defaultAgeRanges;

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
            <TooltipProvider>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Resident Management</h1>
                            <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                                Manage resident profiles and information
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setIsBulkMode(!isBulkMode)}
                                        className={`h-9 ${isBulkMode ? 'bg-blue-50 border-blue-200 text-blue-700' : ''}`}
                                    >
                                        {isBulkMode ? (
                                            <>
                                                <Layers className="h-4 w-4 mr-2" />
                                                Bulk Mode
                                            </>
                                        ) : (
                                            <>
                                                <MousePointer className="h-4 w-4 mr-2" />
                                                Bulk Select
                                            </>
                                        )}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Toggle Bulk Mode (Ctrl+Shift+B)</p>
                                    <p className="text-xs text-gray-500">Select multiple residents for batch operations</p>
                                </TooltipContent>
                            </Tooltip>
                            <Link href="/residents/create">
                                <Button className="h-9">
                                    <Plus className="h-4 w-4 mr-2" />
                                    <span className="hidden sm:inline">Add Resident</span>
                                    <span className="sm:hidden">Add</span>
                                </Button>
                            </Link>
                        </div>
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
                                <div className="text-xl sm:text-2xl font-bold">{safeNumber(stats.total).toLocaleString()}</div>
                                <div className="text-xs sm:text-sm text-gray-500 mt-1">
                                    {safeNumber(stats.maleCount)} M • {safeNumber(stats.femaleCount)} F
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
                                <div className="text-xl sm:text-2xl font-bold">{safeNumber(stats.active).toLocaleString()}</div>
                                <div className="text-xs sm:text-sm text-gray-500 mt-1">
                                    {safeNumber(stats.voterCount)} voters • {safeNumber(stats.seniorCount)} seniors
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
                                <div className="text-xl sm:text-2xl font-bold text-green-600">+{safeNumber(stats.newThisMonth)}</div>
                                <div className="text-xs sm:text-sm text-gray-500 mt-1">
                                    Avg. Age: {safeNumber(stats.avgAge).toFixed(1)}
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
                                <div className="text-xl sm:text-2xl font-bold">{safeNumber(stats.pwdCount)}</div>
                                <div className="text-xs sm:text-sm text-gray-500 mt-1">
                                    PWDs • {safeNumber(stats.headCount)} Heads
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
                                            ref={searchInputRef}
                                            placeholder="Search residents by name, contact, address, occupation... (Ctrl+F)"
                                            className="pl-10"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                        />
                                        {search && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                                                onClick={() => setSearch('')}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        )}
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

                                {/* Active filters indicator and clear button */}
                                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                    <div className="text-sm text-gray-500">
                                        Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} residents
                                        {search && ` matching "${search}"`}
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                        {hasActiveFilters && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={handleClearFilters}
                                                className="text-red-600 hover:text-red-700 h-8"
                                            >
                                                <FilterX className="h-3.5 w-3.5 mr-1" />
                                                Clear Filters
                                            </Button>
                                        )}
                                        {isBulkMode && (
                                            <div className="flex items-center gap-2" ref={selectionRef}>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setShowSelectionOptions(!showSelectionOptions)}
                                                    className="h-8"
                                                >
                                                    <Layers className="h-3.5 w-3.5 mr-1" />
                                                    Select
                                                </Button>
                                                {showSelectionOptions && (
                                                    <div className="absolute right-0 top-full mt-1 z-50 w-48 bg-white dark:bg-gray-800 border rounded-md shadow-lg">
                                                        <div className="p-2">
                                                            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 py-1">
                                                                SELECTION OPTIONS
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                className="w-full justify-start h-8 text-sm"
                                                                onClick={handleSelectAllOnPage}
                                                            >
                                                                <Rows className="h-3.5 w-3.5 mr-2" />
                                                                Current Page ({paginatedResidents.length})
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                className="w-full justify-start h-8 text-sm"
                                                                onClick={handleSelectAllFiltered}
                                                            >
                                                                <Filter className="h-3.5 w-3.5 mr-2" />
                                                                All Filtered ({filteredResidents.length})
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                className="w-full justify-start h-8 text-sm"
                                                                onClick={handleSelectAll}
                                                            >
                                                                <Hash className="h-3.5 w-3.5 mr-2" />
                                                                All ({residents.total})
                                                            </Button>
                                                            <div className="border-t my-1"></div>
                                                            <Button
                                                                variant="ghost"
                                                                className="w-full justify-start h-8 text-sm text-red-600 hover:text-red-700"
                                                                onClick={() => setSelectedResidents([])}
                                                            >
                                                                <RotateCcw className="h-3.5 w-3.5 mr-2" />
                                                                Clear Selection
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
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
                            </div>
                        </CardContent>
                    </Card>

                    {/* Enhanced Bulk Actions Bar */}
                    {isBulkMode && selectedResidents.length > 0 && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4 shadow-sm">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-full border">
                                        <PackageCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                        <span className="font-medium text-sm">
                                            {selectedResidents.length} selected
                                        </span>
                                        <Badge variant="outline" className="ml-1 h-5 text-xs">
                                            {selectionMode === 'page' ? 'Page' : 
                                             selectionMode === 'filtered' ? 'Filtered' : 'All'}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setSelectedResidents([]);
                                                setIsSelectAll(false);
                                            }}
                                            className="h-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <PackageX className="h-3.5 w-3.5 mr-1" />
                                            Clear
                                        </Button>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={handleCopySelectedData}
                                                    className="h-7"
                                                >
                                                    <ClipboardCopy className="h-3.5 w-3.5" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                Copy selected data as CSV
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                </div>
                                
                                <div className="flex flex-wrap items-center gap-2" ref={bulkActionRef}>
                                    <div className="flex items-center gap-2">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={handleSmartBulkAction}
                                                    className="h-8"
                                                    disabled={isPerformingBulkAction}
                                                >
                                                    <FileSpreadsheet className="h-3.5 w-3.5 mr-1" />
                                                    Export
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                Smart export based on selection
                                            </TooltipContent>
                                        </Tooltip>
                                        
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleBulkOperation('generate_ids')}
                                                    className="h-8"
                                                    disabled={isPerformingBulkAction}
                                                >
                                                    <QrCode className="h-3.5 w-3.5 mr-1" />
                                                    IDs
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                Generate IDs for selected
                                            </TooltipContent>
                                        </Tooltip>
                                        
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setShowBulkStatusDialog(true)}
                                                    className="h-8"
                                                    disabled={isPerformingBulkAction}
                                                >
                                                    <Edit className="h-3.5 w-3.5 mr-1" />
                                                    Edit
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                Bulk edit selected residents
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                    
                                    <div className="relative">
                                        <Button
                                            onClick={() => setShowBulkActions(!showBulkActions)}
                                            className="h-8 bg-blue-600 hover:bg-blue-700 text-white"
                                            disabled={isPerformingBulkAction}
                                        >
                                            {isPerformingBulkAction ? (
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            ) : (
                                                <>
                                                    <Layers className="h-3.5 w-3.5 mr-1" />
                                                    More
                                                </>
                                            )}
                                        </Button>
                                        
                                        {showBulkActions && (
                                            <div className="absolute right-0 top-full mt-1 z-50 w-56 bg-white dark:bg-gray-800 border rounded-md shadow-lg">
                                                <div className="p-2">
                                                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 py-1">
                                                        BULK ACTIONS
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        className="w-full justify-start h-8 text-sm"
                                                        onClick={() => setShowBulkPurokDialog(true)}
                                                    >
                                                        <Home className="h-3.5 w-3.5 mr-2" />
                                                        Update Purok
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        className="w-full justify-start h-8 text-sm"
                                                        onClick={() => handleBulkOperation('send_message')}
                                                    >
                                                        <Mail className="h-3.5 w-3.5 mr-2" />
                                                        Send SMS
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        className="w-full justify-start h-8 text-sm"
                                                        onClick={() => handleBulkOperation('print')}
                                                    >
                                                        <Printer className="h-3.5 w-3.5 mr-2" />
                                                        Print Profiles
                                                    </Button>
                                                    <DropdownMenuSeparator />
                                                    <Button
                                                        variant="ghost"
                                                        className="w-full justify-start h-8 text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => setShowBulkDeleteDialog(true)}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5 mr-2" />
                                                        Delete Selected
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <Button
                                        variant="outline"
                                        className="h-8"
                                        onClick={() => setIsBulkMode(false)}
                                        disabled={isPerformingBulkAction}
                                    >
                                        <X className="h-3.5 w-3.5 mr-1" />
                                        Exit
                                    </Button>
                                </div>
                            </div>
                            
                            {/* Enhanced stats of selected items */}
                            {selectedResidentsData.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-blue-100 dark:border-blue-800">
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Users className="h-3.5 w-3.5 text-blue-500" />
                                            <span>
                                                {selectionStats.total} total
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <User className="h-3.5 w-3.5 text-green-500" />
                                            <span>
                                                {selectionStats.male}M • {selectionStats.female}F
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                                            <span>
                                                {selectionStats.voters} voters
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Crown className="h-3.5 w-3.5 text-amber-500" />
                                            <span>
                                                {selectionStats.heads} heads
                                            </span>
                                        </div>
                                    </div>
                                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-3 w-3 text-purple-500" />
                                            <span>Avg age: {selectionStats.avgAge.toFixed(1)}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Camera className="h-3 w-3 text-cyan-500" />
                                            <span>{selectionStats.hasPhotos} with photos</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Residents Table */}
                    <Card className="overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                            <div className="flex items-center gap-4">
                                <CardTitle className="text-lg sm:text-xl">
                                    Resident List
                                    {selectedResidents.length > 0 && isBulkMode && (
                                        <span className="ml-2 text-sm font-normal text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                            {selectedResidents.length} selected
                                        </span>
                                    )}
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={`h-8 w-8 p-0 ${viewMode === 'table' ? 'bg-gray-100' : ''}`}
                                                onClick={() => setViewMode('table')}
                                            >
                                                <List className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Table view</TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={`h-8 w-8 p-0 ${viewMode === 'grid' ? 'bg-gray-100' : ''}`}
                                                onClick={() => setViewMode('grid')}
                                            >
                                                <Grid3X3 className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Grid view</TooltipContent>
                                    </Tooltip>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    checked={isBulkMode}
                                                    onCheckedChange={setIsBulkMode}
                                                    className="data-[state=checked]:bg-blue-600"
                                                />
                                                <Label htmlFor="bulk-mode" className="text-sm font-medium cursor-pointer whitespace-nowrap">
                                                    Bulk Mode
                                                </Label>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Toggle bulk selection mode</p>
                                            <p className="text-xs text-gray-500">Ctrl+Shift+B • Ctrl+A to select</p>
                                            <p className="text-xs text-gray-500">Esc to exit • Del to delete</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                                
                                <div className="text-sm text-gray-500 hidden sm:block">
                                    Page {currentPage} of {totalPages}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <div className="min-w-full inline-block align-middle">
                                    <div className="overflow-hidden">
                                        <Table className="min-w-full">
                                            <TableHeader>
                                                <TableRow className="bg-gray-50 dark:bg-gray-800">
                                                    {isBulkMode && (
                                                        <TableHead className="px-4 py-3 text-center w-12">
                                                            <div className="flex items-center justify-center">
                                                                <Checkbox
                                                                    checked={isSelectAll && paginatedResidents.length > 0}
                                                                    onCheckedChange={handleSelectAllOnPage}
                                                                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                                                />
                                                            </div>
                                                        </TableHead>
                                                    )}
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
                                                        <TableCell colSpan={isBulkMode ? 8 : 7} className="text-center py-8 text-gray-500">
                                                            <div className="flex flex-col items-center justify-center space-y-4">
                                                                <User className="h-16 w-16 text-gray-300 dark:text-gray-700" />
                                                                <div>
                                                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                                                        No residents found
                                                                    </h3>
                                                                    <p className="text-gray-500 dark:text-gray-400">
                                                                        {hasActiveFilters 
                                                                            ? 'Try changing your filters or search criteria.'
                                                                            : 'Get started by adding a resident.'}
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
                                                                    <Link href="/residents/create">
                                                                        <Button className="h-8">
                                                                            <Plus className="h-3 w-3 mr-1" />
                                                                            Add Resident
                                                                        </Button>
                                                                    </Link>
                                                                </div>
                                                            </div>
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
                                                        const isSelected = selectedResidents.includes(resident.id);
                                                        
                                                        return (
                                                            <TableRow 
                                                                key={resident.id} 
                                                                className={`hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors ${
                                                                    isSelected ? 'bg-blue-50 dark:bg-blue-900/10 border-l-4 border-l-blue-500' : ''
                                                                } ${isHead ? 'bg-yellow-50/30 dark:bg-yellow-900/10' : ''}`}
                                                                onClick={(e) => {
                                                                    if (isBulkMode && e.target instanceof HTMLElement && 
                                                                        !e.target.closest('a') && 
                                                                        !e.target.closest('button') &&
                                                                        !e.target.closest('.dropdown-menu-content') &&
                                                                        !e.target.closest('input[type="checkbox"]')) {
                                                                        handleItemSelect(resident.id);
                                                                    }
                                                                }}
                                                            >
                                                                {isBulkMode && (
                                                                    <TableCell className="px-4 py-3 text-center">
                                                                        <div className="flex items-center justify-center">
                                                                            <Checkbox
                                                                                checked={isSelected}
                                                                                onCheckedChange={() => handleItemSelect(resident.id)}
                                                                                onClick={(e) => e.stopPropagation()}
                                                                                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                                                            />
                                                                        </div>
                                                                    </TableCell>
                                                                )}
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
                                                                                onClick={(e) => e.stopPropagation()}
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

                                                                            {isBulkMode && (
                                                                                <>
                                                                                    <DropdownMenuSeparator />
                                                                                    <DropdownMenuItem 
                                                                                        onClick={() => handleItemSelect(resident.id)}
                                                                                        className="flex items-center cursor-pointer"
                                                                                    >
                                                                                        {isSelected ? (
                                                                                            <>
                                                                                                <CheckSquare className="mr-2 h-4 w-4 text-green-600" />
                                                                                                <span className="text-green-600">Deselect</span>
                                                                                            </>
                                                                                        ) : (
                                                                                            <>
                                                                                                <Square className="mr-2 h-4 w-4" />
                                                                                                <span>Select for Bulk</span>
                                                                                            </>
                                                                                        )}
                                                                                    </DropdownMenuItem>
                                                                                </>
                                                                            )}
                                                                            
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

                    {/* Keyboard Shortcuts Help */}
                    {isBulkMode && (
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <KeyRound className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm font-medium">Keyboard Shortcuts</span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsBulkMode(false)}
                                    className="h-7 text-xs"
                                    disabled={isPerformingBulkAction}
                                >
                                    Exit Bulk Mode
                                </Button>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 text-xs text-gray-600 dark:text-gray-400">
                                <div className="flex items-center gap-1">
                                    <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Ctrl+A</kbd>
                                    <span>Select page</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Shift+Ctrl+A</kbd>
                                    <span>Select filtered</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Delete</kbd>
                                    <span>Delete selected</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Esc</kbd>
                                    <span>Exit/clear</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </TooltipProvider>

            {/* Bulk Delete Confirmation Dialog */}
            <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Selected Residents</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {selectedResidents.length} selected resident{selectedResidents.length !== 1 ? 's' : ''}?
                            This action cannot be undone. Deceased residents cannot be deleted.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPerformingBulkAction}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => handleBulkOperation('delete')}
                            className="bg-red-600 hover:bg-red-700 text-white"
                            disabled={isPerformingBulkAction}
                        >
                            {isPerformingBulkAction ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                'Delete Selected'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Bulk Status Update Dialog */}
            <AlertDialog open={showBulkStatusDialog} onOpenChange={setShowBulkStatusDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Bulk Update Status</AlertDialogTitle>
                        <AlertDialogDescription>
                            Update status for {selectedResidents.length} selected residents.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label>New Status</Label>
                            <select 
                                className="w-full border rounded px-3 py-2 mt-1"
                                value={bulkEditValue}
                                onChange={(e) => setBulkEditValue(e.target.value)}
                            >
                                <option value="">Select Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="deceased">Deceased</option>
                            </select>
                        </div>
                        <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded">
                            <div className="font-medium mb-1">Current selection stats:</div>
                            <ul className="list-disc list-inside space-y-1">
                                <li>{selectionStats.total} total residents</li>
                                <li>{selectionStats.active} active</li>
                                <li>{selectionStats.male} male • {selectionStats.female} female</li>
                                <li>{selectionStats.voters} registered voters</li>
                                <li>{selectionStats.heads} heads of household</li>
                                <li>Average age: {selectionStats.avgAge.toFixed(1)}</li>
                            </ul>
                        </div>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPerformingBulkAction}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => handleBulkOperation('update_status')}
                            disabled={isPerformingBulkAction || !bulkEditValue}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {isPerformingBulkAction ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                'Update Status'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Bulk Purok Update Dialog */}
            <AlertDialog open={showBulkPurokDialog} onOpenChange={setShowBulkPurokDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Bulk Update Purok</AlertDialogTitle>
                        <AlertDialogDescription>
                            Update purok for {selectedResidents.length} selected residents.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label>New Purok</Label>
                            <select 
                                className="w-full border rounded px-3 py-2 mt-1"
                                value={bulkEditValue}
                                onChange={(e) => setBulkEditValue(e.target.value)}
                            >
                                <option value="">Select Purok</option>
                                {puroks.map((purok) => (
                                    <option key={purok.id} value={purok.id}>
                                        {purok.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded">
                            <div className="font-medium mb-1">Current purok distribution:</div>
                            <ul className="list-disc list-inside space-y-1">
                                {(() => {
                                    const purokCounts: Record<string, number> = {};
                                    selectedResidentsData.forEach(resident => {
                                        const purokName = resident.purok?.name || 'No Purok';
                                        purokCounts[purokName] = (purokCounts[purokName] || 0) + 1;
                                    });
                                    
                                    return Object.entries(purokCounts).map(([purok, count]) => (
                                        <li key={purok}>{purok}: {count} resident(s)</li>
                                    ));
                                })()}
                            </ul>
                        </div>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPerformingBulkAction}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => handleBulkOperation('update_purok')}
                            disabled={isPerformingBulkAction || !bulkEditValue}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {isPerformingBulkAction ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                'Update Purok'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}