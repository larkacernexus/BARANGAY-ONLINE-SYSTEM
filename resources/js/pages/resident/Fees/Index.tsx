import { useState, useEffect, useMemo, useRef } from 'react';
import ResidentLayout from '@/layouts/resident-app-layout';
import { Card, CardContent } from '@/components/ui/card';
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
    Eye,
    Plus,
    Check,
    X,
    Square,
    Grid,
    List,
    MoreVertical,
    Copy,
    FileText,
    Printer,
    Download,
    Share2,
    Filter,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    ChevronDown,
    BarChart,
    Loader2,
    Calendar,
    CreditCard,
    XCircle,
    User,
    Clock,
    SlidersHorizontal,
} from 'lucide-react';
import { Link, usePage, router, Head } from '@inertiajs/react';
import { toast } from 'sonner';

// FIX: Try importing Select components differently
import * as SelectPrimitive from '@radix-ui/react-select';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Import extracted components
import { StatusBadge } from '@/components/residentui/StatusBadge';
import { MobileFeeCard } from '@/components/residentui/MobileFeeCard';
import { DesktopGridViewCard } from '@/components/residentui/DesktopGridViewCard';
import { CollapsibleStats } from '@/components/residentui/CollapsibleStats';
import { DesktopStats } from '@/components/residentui/DesktopStats';
import { CustomTabs } from '@/components/residentui/CustomTabs';

interface DocumentCategory {
    id: number;
    name: string;
    slug: string;
}

interface FeeType {
    id: number;
    code: string;
    name: string;
    category: string;
    category_display: string;
    document_category?: DocumentCategory | null;
}

interface Fee {
    id: number;
    fee_code: string;
    or_number?: string;
    certificate_number?: string;
    purpose: string;
    payer_name: string;
    address: string;
    purok?: string;
    zone?: string;
    billing_period?: string;
    issue_date: string;
    due_date: string;
    period_start?: string;
    period_end?: string;
    base_amount: number;
    surcharge_amount: number;
    penalty_amount: number;
    discount_amount: number;
    total_amount: number;
    amount_paid: number;
    balance: number;
    status: string;
    remarks?: string;
    formatted_issue_date: string;
    formatted_due_date: string;
    formatted_total: string;
    formatted_balance: string;
    formatted_amount_paid: string;
    is_overdue: boolean;
    days_overdue: number;
    fee_type?: FeeType;
    resident?: {
        id: number;
        first_name: string;
        last_name: string;
        middle_name?: string;
    };
}

interface PageProps extends Record<string, any> {
    fees?: {
        data: Fee[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    stats?: {
        total_fees: number;
        pending_fees: number;
        overdue_fees: number;
        paid_fees: number;
        issued_fees?: number;
        cancelled_fees?: number;
        total_balance: number;
        total_paid: number;
        current_year_total: number;
        current_year_paid: number;
        current_year_balance: number;
    };
    availableYears?: number[];
    availableFeeTypes?: Array<{
        id: number;
        code: string;
        name: string;
        category: string;
        category_display: string;
        document_category?: DocumentCategory | null;
    }>;
    householdResidents?: Array<{
        id: number;
        first_name: string;
        last_name: string;
        middle_name?: string;
    }>;
    currentResident?: {
        id: number;
        first_name: string;
        last_name: string;
    };
    hasProfile?: boolean;
    filters?: {
        search?: string;
        status?: string;
        fee_type?: string;
        year?: string;
        resident?: string;
        page?: string;
    };
    error?: string;
}

// Custom Select Component with debugging
interface CustomSelectProps {
    value: string;
    onValueChange: (value: string) => void;
    placeholder: string;
    options: Array<{ value: string; label: string }>;
    disabled?: boolean;
}

const CustomSelect = ({ value, onValueChange, placeholder, options, disabled }: CustomSelectProps) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        console.log('CustomSelect onChange:', e.target.value);
        onValueChange(e.target.value);
    };

    return (
        <div className="relative">
            <select
                value={value}
                onChange={handleChange}
                disabled={disabled}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
                <option value="">{placeholder}</option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronDown className="h-4 w-4 opacity-50" />
            </div>
        </div>
    );
};

// Mobile Filter Modal Component
interface MobileFilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    search: string;
    onSearchChange: (value: string) => void;
    onSearchSubmit: (e: React.FormEvent) => void;
    onSearchClear: () => void;
    feeTypeFilter: string;
    onFeeTypeChange: (type: string) => void;
    residentFilter: string;
    onResidentChange: (resident: string) => void;
    yearFilter: string;
    onYearChange: (year: string) => void;
    loading: boolean;
    availableFeeTypes: Array<{
        id: number;
        code: string;
        name: string;
        category: string;
        category_display: string;
        document_category?: DocumentCategory | null;
    }>;
    availableYears: number[];
    householdResidents: Array<{
        id: number;
        first_name: string;
        last_name: string;
        middle_name?: string;
    }>;
    hasActiveFilters: boolean;
    onClearFilters: () => void;
}

const MobileFilterModal = ({
    isOpen,
    onClose,
    search,
    onSearchChange,
    onSearchSubmit,
    onSearchClear,
    feeTypeFilter,
    onFeeTypeChange,
    residentFilter,
    onResidentChange,
    yearFilter,
    onYearChange,
    loading,
    availableFeeTypes,
    availableYears,
    householdResidents,
    hasActiveFilters,
    onClearFilters,
}: MobileFilterModalProps) => {
    if (!isOpen) return null;

    // Prepare options for CustomSelect
    const feeTypeOptions = [
        { value: 'all', label: 'All fee types' },
        ...availableFeeTypes.map(type => ({
            value: type.id.toString(),
            label: type.name
        }))
    ];

    const residentOptions = [
        { value: 'all', label: 'All residents' },
        ...householdResidents.map(resident => ({
            value: resident.id.toString(),
            label: `${resident.first_name} ${resident.last_name}`
        }))
    ];

    const yearOptions = [
        { value: 'all', label: 'All years' },
        ...availableYears.map(year => ({
            value: year.toString(),
            label: year.toString()
        }))
    ];

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-[100] backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed bottom-0 left-0 right-0 z-[101] animate-in slide-in-from-bottom duration-300">
                <div className="bg-white dark:bg-gray-900 rounded-t-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b dark:border-gray-800">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <SlidersHorizontal className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                    Filter Fees
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {hasActiveFilters ? 'Filters applied' : 'No filters applied'}
                                </p>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-20">
                        {/* Search */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Search Fees
                            </label>
                            <form onSubmit={onSearchSubmit} className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    type="search"
                                    placeholder="Search by fee code, purpose..."
                                    value={search}
                                    onChange={(e) => onSearchChange(e.target.value)}
                                    className="pl-10 pr-10"
                                />
                                {search && (
                                    <button
                                        type="button"
                                        onClick={onSearchClear}
                                        className="absolute right-3 top-1/2 -translate-y-1/2"
                                    >
                                        <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                                    </button>
                                )}
                            </form>
                        </div>

                        {/* Fee Type Filter */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Fee Type
                            </label>
                            <CustomSelect
                                value={feeTypeFilter}
                                onValueChange={onFeeTypeChange}
                                placeholder="All fee types"
                                options={feeTypeOptions}
                                disabled={loading}
                            />
                        </div>

                        {/* Resident Filter */}
                        {householdResidents.length > 0 && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Resident
                                </label>
                                <CustomSelect
                                    value={residentFilter}
                                    onValueChange={onResidentChange}
                                    placeholder="All residents"
                                    options={residentOptions}
                                    disabled={loading}
                                />
                            </div>
                        )}

                        {/* Year Filter */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Year
                            </label>
                            <CustomSelect
                                value={yearFilter}
                                onValueChange={onYearChange}
                                placeholder="All years"
                                options={yearOptions}
                                disabled={loading}
                            />
                        </div>

                        {/* Active Filters Indicator */}
                        {hasActiveFilters && (
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                                    <span className="text-sm text-blue-700 dark:text-blue-300">
                                        Filters are active
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="border-t dark:border-gray-800 p-4 space-y-3 pb-safe-bottom">
                        {hasActiveFilters && (
                            <Button
                                variant="outline"
                                onClick={() => {
                                    onClearFilters();
                                    onClose();
                                }}
                                className="w-full"
                            >
                                <X className="h-4 w-4 mr-2" />
                                Clear All Filters
                            </Button>
                        )}
                        <Button onClick={onClose} className="w-full">
                            <Check className="h-4 w-4 mr-2" />
                            Apply Filters
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
};

// Desktop Filters Section Component
interface FiltersSectionProps {
    search: string;
    setSearch: (value: string) => void;
    handleSearchSubmit: (e: React.FormEvent) => void;
    handleSearchClear: () => void;
    feeTypeFilter: string;
    handleFeeTypeChange: (type: string) => void;
    residentFilter: string;
    handleResidentChange: (resident: string) => void;
    yearFilter: string;
    handleYearChange: (year: string) => void;
    loading: boolean;
    availableFeeTypes: Array<{
        id: number;
        code: string;
        name: string;
        category: string;
        category_display: string;
        document_category?: DocumentCategory | null;
    }>;
    availableYears: number[];
    householdResidents: Array<{
        id: number;
        first_name: string;
        last_name: string;
        middle_name?: string;
    }>;
    printFees: () => void;
    exportToCSV: () => void;
    isExporting: boolean;
    hasActiveFilters: boolean;
    handleClearFilters: () => void;
}

const FiltersSection = ({
    search,
    setSearch,
    handleSearchSubmit,
    handleSearchClear,
    feeTypeFilter,
    handleFeeTypeChange,
    residentFilter,
    handleResidentChange,
    yearFilter,
    handleYearChange,
    loading,
    availableFeeTypes,
    availableYears,
    householdResidents,
    printFees,
    exportToCSV,
    isExporting,
    hasActiveFilters,
    handleClearFilters,
}: FiltersSectionProps) => {
    // Prepare options
    const feeTypeOptions = [
        { value: 'all', label: 'All fee types' },
        ...availableFeeTypes.map(type => ({
            value: type.id.toString(),
            label: type.name
        }))
    ];

    const residentOptions = [
        { value: 'all', label: 'All residents' },
        ...householdResidents.map(resident => ({
            value: resident.id.toString(),
            label: `${resident.first_name} ${resident.last_name}`
        }))
    ];

    const yearOptions = [
        { value: 'all', label: 'All years' },
        ...availableYears.map(year => ({
            value: year.toString(),
            label: year.toString()
        }))
    ];

    return (
        <Card className="border border-gray-200 dark:border-gray-700">
            <CardContent className="p-4 md:p-6">
                <div className="space-y-4">
                    {/* Search */}
                    <div className="relative">
                        <form onSubmit={handleSearchSubmit} className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                type="search"
                                placeholder="Search by fee code, purpose..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 pr-10"
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={handleSearchClear}
                                    className="absolute right-3 top-1/2 -translate-y-1/2"
                                >
                                    <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                                </button>
                            )}
                        </form>
                    </div>

                    {/* Filters Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* Fee Type Filter */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                                Fee Type
                            </label>
                            <CustomSelect
                                value={feeTypeFilter}
                                onValueChange={handleFeeTypeChange}
                                placeholder="All fee types"
                                options={feeTypeOptions}
                                disabled={loading}
                            />
                        </div>

                        {/* Resident Filter */}
                        {householdResidents.length > 0 && (
                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                                    Resident
                                </label>
                                <CustomSelect
                                    value={residentFilter}
                                    onValueChange={handleResidentChange}
                                    placeholder="All residents"
                                    options={residentOptions}
                                    disabled={loading}
                                />
                            </div>
                        )}

                        {/* Year Filter */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                                Year
                            </label>
                            <CustomSelect
                                value={yearFilter}
                                onValueChange={handleYearChange}
                                placeholder="All years"
                                options={yearOptions}
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2 pt-2">
                        {hasActiveFilters && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleClearFilters}
                                className="gap-2"
                            >
                                <X className="h-4 w-4" />
                                Clear Filters
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={printFees}
                            className="gap-2"
                        >
                            <Printer className="h-4 w-4" />
                            Print List
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={exportToCSV}
                            disabled={isExporting}
                            className="gap-2"
                        >
                            <Download className="h-4 w-4" />
                            {isExporting ? 'Exporting...' : 'Export CSV'}
                        </Button>
                    </div>

                    {/* Active Filters Indicator */}
                    {hasActiveFilters && (
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                                <span className="text-sm text-blue-700 dark:text-blue-300">
                                    Filters are active
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default function MyFees() {
    const page = usePage<PageProps>();
    const pageProps = page.props;
    
    const fees = pageProps.fees || {
        data: [],
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 0,
        from: 0,
        to: 0,
        links: [],
    };
    
    const stats = pageProps.stats || {
        total_fees: 0,
        pending_fees: 0,
        overdue_fees: 0,
        paid_fees: 0,
        issued_fees: 0,
        cancelled_fees: 0,
        total_balance: 0,
        total_paid: 0,
        current_year_total: 0,
        current_year_paid: 0,
        current_year_balance: 0,
    };
    
    const availableYears = pageProps.availableYears || [];
    const availableFeeTypes = pageProps.availableFeeTypes || [];
    const householdResidents = pageProps.householdResidents || [];
    const currentResident = pageProps.currentResident || { id: 0, first_name: '', last_name: '' };
    const hasProfile = pageProps.hasProfile || false;
    const filters = pageProps.filters || {};
    
    // Initialize with debug logging
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [feeTypeFilter, setFeeTypeFilter] = useState('all');
    const [residentFilter, setResidentFilter] = useState('all');
    const [yearFilter, setYearFilter] = useState('all');
    const [loading, setLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [showStats, setShowStats] = useState(true);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [selectedFees, setSelectedFees] = useState<number[]>([]);
    const [isExporting, setIsExporting] = useState(false);
    const [selectMode, setSelectMode] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    
    const hasInitialized = useRef(false);
    const searchTimeout = useRef<NodeJS.Timeout | null>(null);
    
    // Check if mobile on mount and resize
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (mobile) {
                setViewMode('grid');
            }
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);
    
    // Initialize filters from props
    useEffect(() => {
        if (!hasInitialized.current) {
            console.log('Initializing filters from props:', {
                search: filters.search,
                status: filters.status,
                fee_type: filters.fee_type,
                year: filters.year,
                resident: filters.resident
            });
            
            setSearch(filters.search || '');
            setStatusFilter(filters.status || 'all');
            setFeeTypeFilter(filters.fee_type || 'all');
            setYearFilter(filters.year || 'all');
            setResidentFilter(filters.resident || 'all');
            hasInitialized.current = true;
        }
    }, [filters]);
    
    // Search debounce
    useEffect(() => {
        if (!hasInitialized.current) return;
        if (search === '' && !filters.search) return;
        if (search === filters.search) return;
        
        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }
        
        searchTimeout.current = setTimeout(() => {
            updateFilters({ 
                search: search.trim(),
                page: '1'
            });
        }, 800);
        
        return () => {
            if (searchTimeout.current) {
                clearTimeout(searchTimeout.current);
            }
        };
    }, [search]);
    
    const updateFilters = (newFilters: Record<string, string>) => {
        console.log('Updating filters:', newFilters);
        setLoading(true);
        
        const updatedFilters = {
            ...filters,
            ...newFilters,
        };
        
        const cleanFilters: Record<string, string> = {};
        
        Object.entries(updatedFilters).forEach(([key, value]) => {
            if (key === 'page' && value === '1') return;
            if (value && value !== '' && value !== 'all' && value !== undefined) {
                cleanFilters[key] = value;
            }
        });
        
        console.log('Clean filters to send:', cleanFilters);
        
        router.get('/residentfees', cleanFilters, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onFinish: () => setLoading(false),
        });
    };
    
    const handleTabChange = (tab: string) => {
        console.log('Tab changed to:', tab);
        setStatusFilter(tab);
        
        if (tab === 'all') {
            updateFilters({ 
                status: '',
                page: '1'
            });
        } else {
            updateFilters({ 
                status: tab,
                page: '1'
            });
        }
        
        if (isMobile) setShowMobileFilters(false);
    };
    
    const handleFeeTypeChange = (type: string) => {
        console.log('Fee type changed:', type, 'Current value:', feeTypeFilter);
        setFeeTypeFilter(type);
        updateFilters({ 
            fee_type: type === 'all' ? '' : type,
            page: '1'
        });
        if (isMobile) setShowMobileFilters(false);
    };
    
    const handleResidentChange = (resident: string) => {
        console.log('Resident changed:', resident, 'Current value:', residentFilter);
        setResidentFilter(resident);
        updateFilters({ 
            resident: resident === 'all' ? '' : resident,
            page: '1'
        });
        if (isMobile) setShowMobileFilters(false);
    };
    
    const handleYearChange = (year: string) => {
        console.log('Year changed:', year, 'Current value:', yearFilter);
        setYearFilter(year);
        updateFilters({ 
            year: year === 'all' ? '' : year,
            page: '1'
        });
        if (isMobile) setShowMobileFilters(false);
    };
    
    const handleClearFilters = () => {
        console.log('Clearing all filters');
        setSearch('');
        setStatusFilter('all');
        setFeeTypeFilter('all');
        setResidentFilter('all');
        setYearFilter('all');
        
        router.get('/residentfees', {}, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setLoading(false),
        });
        
        if (isMobile) setShowMobileFilters(false);
    };
    
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }
        updateFilters({ 
            search: search.trim(),
            page: '1'
        });
    };
    
    const handleSearchClear = () => {
        setSearch('');
        updateFilters({ 
            search: '',
            page: '1'
        });
    };
    
    // Selection mode functions
    const toggleSelectFee = (id: number) => {
        setSelectedFees(prev =>
            prev.includes(id)
                ? prev.filter(feeId => feeId !== id)
                : [...prev, id]
        );
    };
    
    const selectAllFees = () => {
        const currentFees = getCurrentTabFees();
        if (selectedFees.length === currentFees.length && currentFees.length > 0) {
            setSelectedFees([]);
        } else {
            setSelectedFees(currentFees.map(f => f.id));
        }
    };
    
    const toggleSelectMode = () => {
        if (selectMode) {
            setSelectMode(false);
            setSelectedFees([]);
        } else {
            setSelectMode(true);
        }
    };
    
    // Utility functions
    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            if (isMobile) {
                return date.toLocaleDateString('en-PH', {
                    month: 'short',
                    day: 'numeric',
                });
            }
            return date.toLocaleDateString('en-PH', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        } catch (error) {
            return 'N/A';
        }
    };
    
    const formatCurrency = (amount: number) => {
        return `₱${amount.toFixed(2)}`;
    };
    
    const getCategoryDisplay = (feeType: FeeType | undefined) => {
        if (!feeType) return '';
        return feeType.document_category?.name || feeType.category_display || feeType.category || 'Uncategorized';
    };
    
    // Get status count from global stats
    const getStatusCount = (status: string) => {
        switch(status) {
            case 'all': 
                return stats.total_fees || 0;
            case 'pending': 
                return stats.pending_fees || 0;
            case 'issued': 
                return stats.issued_fees || fees.data.filter(f => f.status === 'issued').length;
            case 'overdue': 
                return stats.overdue_fees || 0;
            case 'paid': 
                return stats.paid_fees || 0;
            case 'cancelled': 
                return stats.cancelled_fees || fees.data.filter(f => f.status === 'cancelled').length;
            default: 
                return 0;
        }
    };
    
    // Get current tab fees
    const getCurrentTabFees = () => {
        return fees.data;
    };
    
    const hasActiveFilters = useMemo(() => {
        return Object.entries(filters).some(([key, value]) => 
            key !== 'page' && value && value !== '' && value !== 'all'
        );
    }, [filters]);
    
    // Print function
    const printFees = () => {
        const currentFees = getCurrentTabFees();
        if (currentFees.length === 0) {
            toast.error('No fees to print');
            return;
        }
        
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            toast.error('Please allow popups to print');
            return;
        }
        
        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>My Fees Report</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
                    .print-header { margin-bottom: 30px; }
                    .print-info { display: flex; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; }
                    .fee-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    .fee-table th { background-color: #f3f4f6; padding: 12px; text-align: left; border: 1px solid #ddd; }
                    .fee-table td { padding: 10px; border: 1px solid #ddd; }
                    .badge { padding: 2px 8px; border-radius: 12px; font-size: 12px; display: inline-block; }
                    .badge-pending { background-color: #fef3c7; color: #92400e; }
                    .badge-issued { background-color: #e9d5ff; color: #6b21a8; }
                    .badge-partially_paid { background-color: #dbeafe; color: #1e40af; }
                    .badge-paid { background-color: #d1fae5; color: #065f46; }
                    .badge-overdue { background-color: #fee2e2; color: #991b1b; }
                    .badge-cancelled { background-color: #f3f4f6; color: #374151; }
                    .footer { margin-top: 40px; text-align: center; color: #6b7280; font-size: 12px; }
                    @media print {
                        body { margin: 0; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="print-header">
                    <h1>My Fees Report</h1>
                    <div class="print-info">
                        <div>
                            <p><strong>Generated:</strong> ${new Date().toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                            <p><strong>Total Fees:</strong> ${currentFees.length}</p>
                            <p><strong>Status:</strong> ${statusFilter === 'all' ? 'All' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}</p>
                        </div>
                        <div>
                            <p><strong>Total Balance:</strong> ${formatCurrency(stats.total_balance)}</p>
                            <p><strong>Total Paid:</strong> ${formatCurrency(stats.total_paid)}</p>
                        </div>
                    </div>
                </div>
                
                <table class="fee-table">
                    <thead>
                        <tr>
                            <th>Fee Code</th>
                            <th>Type</th>
                            <th>Purpose</th>
                            <th>Issue Date</th>
                            <th>Due Date</th>
                            <th>Status</th>
                            <th>Amount</th>
                            <th>Balance</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${currentFees.map(fee => `
                            <tr>
                                <td>${fee.fee_code}</td>
                                <td>${getCategoryDisplay(fee.fee_type)}</td>
                                <td>${fee.purpose}</td>
                                <td>${formatDate(fee.issue_date)}</td>
                                <td>${formatDate(fee.due_date)}</td>
                                <td><span class="badge badge-${fee.status}">${fee.status.replace('_', ' ').toUpperCase()}</span></td>
                                <td>${fee.formatted_total}</td>
                                <td>${fee.formatted_balance}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <div class="footer">
                    <p>Generated from Barangay Management System</p>
                    <p>Page 1 of 1</p>
                </div>
            </body>
            </html>
        `;
        
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    };
    
    // Export to CSV
    const exportToCSV = () => {
        const currentFees = getCurrentTabFees();
        if (currentFees.length === 0) {
            toast.error('No fees to export');
            return;
        }
        
        setIsExporting(true);
        
        const headers = ['Fee Code', 'OR Number', 'Certificate Number', 'Type', 'Purpose', 'Issue Date', 'Due Date', 'Status', 'Base Amount', 'Surcharge', 'Penalty', 'Discount', 'Total Amount', 'Amount Paid', 'Balance'];
        
        const csvData = currentFees.map(fee => [
            fee.fee_code,
            fee.or_number || 'N/A',
            fee.certificate_number || 'N/A',
            getCategoryDisplay(fee.fee_type),
            `"${(fee.purpose || '').replace(/"/g, '""')}"`,
            formatDate(fee.issue_date),
            formatDate(fee.due_date),
            fee.status.replace('_', ' ').toUpperCase(),
            (fee.base_amount || 0).toFixed(2),
            (fee.surcharge_amount || 0).toFixed(2),
            (fee.penalty_amount || 0).toFixed(2),
            (fee.discount_amount || 0).toFixed(2),
            (fee.total_amount || 0).toFixed(2),
            (fee.amount_paid || 0).toFixed(2),
            (fee.balance || 0).toFixed(2)
        ]);
        
        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `fees_${statusFilter}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        setIsExporting(false);
        toast.success('CSV file downloaded successfully');
    };
    
    const renderTabContent = () => {
        const currentFees = getCurrentTabFees();
        const tabHasData = currentFees.length > 0;
        
        return (
            <Card className="border border-gray-200 dark:border-gray-700">
                <CardContent className="p-4 md:p-6">
                    {/* Selection Mode Banner */}
                    {selectMode && tabHasData && (
                        <div className="mb-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <Badge variant="secondary" className="gap-1">
                                        <Square className="h-3 w-3" />
                                        Selection Mode
                                    </Badge>
                                    <span className="text-sm text-blue-700 dark:text-blue-300">
                                        {selectedFees.length} fee{selectedFees.length !== 1 ? 's' : ''} selected
                                    </span>
                                </div>
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={selectAllFees}
                                        className="flex-1 sm:flex-none"
                                    >
                                        {selectedFees.length === currentFees.length && currentFees.length > 0
                                            ? 'Deselect All'
                                            : 'Select All'}
                                    </Button>
                                    {selectedFees.length > 0 && (
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => {
                                                if (confirm(`Are you sure you want to delete ${selectedFees.length} selected fees?`)) {
                                                    toast.success(`Deleted ${selectedFees.length} fees`);
                                                    setSelectedFees([]);
                                                    setSelectMode(false);
                                                }
                                            }}
                                            className="flex-1 sm:flex-none"
                                        >
                                            Delete Selected
                                        </Button>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setSelectMode(false);
                                            setSelectedFees([]);
                                        }}
                                        className="flex-1 sm:flex-none"
                                    >
                                        <X className="h-4 w-4 mr-1" />
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Fees List Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                {statusFilter === 'all' ? 'All' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Fees
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {tabHasData 
                                    ? `Showing ${currentFees.length} fee${currentFees.length !== 1 ? 's' : ''}`
                                    : `No ${statusFilter === 'all' ? 'fees' : statusFilter.replace('_', ' ')} found`
                                }
                                {selectMode && selectedFees.length > 0 && ` • ${selectedFees.length} selected`}
                                {(feeTypeFilter !== 'all' || residentFilter !== 'all' || yearFilter !== 'all' || search) && ' (filtered)'}
                                {selectMode && ' • Selection Mode'}
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <div className="flex gap-2">
                                {!selectMode && tabHasData && (
                                    <>
                                        <div className="hidden md:flex gap-2">
                                            <Button
                                                variant={viewMode === 'grid' ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => setViewMode('grid')}
                                                className="gap-2"
                                            >
                                                <Grid className="h-4 w-4" />
                                                Grid
                                            </Button>
                                            <Button
                                                variant={viewMode === 'list' ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => setViewMode('list')}
                                                className="gap-2"
                                            >
                                                <List className="h-4 w-4" />
                                                List
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={toggleSelectMode}
                                                className="gap-2"
                                            >
                                                <Square className="h-4 w-4" />
                                                Select
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    {!tabHasData ? (
                        <div className="text-center py-12">
                            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                {(() => {
                                    const Icon = statusFilter === 'all' ? List : 
                                               statusFilter === 'pending' ? Clock :
                                               statusFilter === 'issued' ? FileText :
                                               statusFilter === 'overdue' ? AlertCircle :
                                               statusFilter === 'paid' ? Check :
                                               statusFilter === 'cancelled' ? XCircle : List;
                                    return <Icon className="h-8 w-8 text-gray-400" />;
                                })()}
                            </div>
                            <h3 className="text-lg font-semibold mb-2">
                                No {statusFilter === 'all' ? 'fees' : statusFilter.replace('_', ' ')} found
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-4">
                                {hasActiveFilters 
                                    ? 'Try adjusting your filters'
                                    : statusFilter === 'all' 
                                        ? 'You have no fees or assessments'
                                        : `You have no ${statusFilter.replace('_', ' ')} fees`}
                            </p>
                            {hasActiveFilters && (
                                <Button variant="outline" onClick={handleClearFilters} size="sm">
                                    Clear Filters
                                </Button>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* Mobile View Mode Toggle */}
                            {isMobile && tabHasData && !selectMode && (
                                <div className="mb-4">
                                    <div className="flex gap-2">
                                        <Button
                                            variant={viewMode === 'grid' ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setViewMode('grid')}
                                            className="flex-1"
                                        >
                                            <Grid className="h-4 w-4 mr-2" />
                                            Grid View
                                        </Button>
                                        <Button
                                            variant={viewMode === 'list' ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setViewMode('list')}
                                            className="flex-1"
                                        >
                                            <List className="h-4 w-4 mr-2" />
                                            List View
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={toggleSelectMode}
                                            className="flex-1"
                                        >
                                            <Square className="h-4 w-4 mr-2" />
                                            Select
                                        </Button>
                                    </div>
                                </div>
                            )}
                            
                            {/* Grid View (Mobile & Desktop) */}
                            {viewMode === 'grid' && (
                                <>
                                    {/* Mobile Grid View */}
                                    {isMobile && (
                                        <div className="pb-4">
                                            {currentFees.map((fee) => (
                                                <MobileFeeCard 
                                                    key={`mobile-fee-${fee.id}`}
                                                    fee={fee}
                                                    selectMode={selectMode}
                                                    selectedFees={selectedFees}
                                                    toggleSelectFee={toggleSelectFee}
                                                    getCategoryDisplay={getCategoryDisplay}
                                                    formatDate={formatDate}
                                                />
                                            ))}
                                        </div>
                                    )}
                                    
                                    {/* Desktop Grid View */}
                                    {!isMobile && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {currentFees.map((fee) => (
                                                <DesktopGridViewCard 
                                                    key={`desktop-fee-${fee.id}`}
                                                    fee={fee}
                                                    selectMode={selectMode}
                                                    selectedFees={selectedFees}
                                                    toggleSelectFee={toggleSelectFee}
                                                    getCategoryDisplay={getCategoryDisplay}
                                                    formatDate={formatDate}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                            
                            {/* List/Table View (Mobile & Desktop) */}
                            {viewMode === 'list' && (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                {selectMode && (
                                                    <TableHead className="w-12">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedFees.length === currentFees.length && currentFees.length > 0}
                                                            onChange={selectAllFees}
                                                            className="h-4 w-4 rounded border-gray-300"
                                                        />
                                                    </TableHead>
                                                )}
                                                <TableHead>Fee Details</TableHead>
                                                <TableHead>Dates</TableHead>
                                                <TableHead>Amount</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {currentFees.map((fee) => (
                                                <TableRow key={`table-fee-${fee.id}`} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                                    {selectMode && (
                                                        <TableCell>
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedFees.includes(fee.id)}
                                                                onChange={() => toggleSelectFee(fee.id)}
                                                                className="h-4 w-4 rounded border-gray-300"
                                                            />
                                                        </TableCell>
                                                    )}
                                                    <TableCell>
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <button
                                                                    onClick={() => {
                                                                        navigator.clipboard.writeText(fee.fee_code);
                                                                        toast.success(`Copied: ${fee.fee_code}`);
                                                                    }}
                                                                    className="font-mono text-sm font-medium hover:text-blue-600 transition-colors"
                                                                    title="Copy fee code"
                                                                >
                                                                    {fee.fee_code}
                                                                </button>
                                                                {fee.or_number && (
                                                                    <Badge variant="outline" size="sm" className="text-xs">
                                                                        OR: {fee.or_number}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <p className="font-medium text-gray-700 dark:text-gray-300">{fee.purpose}</p>
                                                            {fee.fee_type && (
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                    {getCategoryDisplay(fee.fee_type)}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            <div>
                                                                <p className="text-xs text-gray-500">Issued</p>
                                                                <p className="text-sm">{formatDate(fee.issue_date)}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-gray-500">Due</p>
                                                                <p className={`text-sm ${fee.is_overdue ? 'text-red-600 font-medium' : ''}`}>
                                                                    {formatDate(fee.due_date)}
                                                                    {fee.is_overdue && fee.days_overdue > 0 && (
                                                                        <span className="text-xs text-red-500 block">
                                                                            {fee.days_overdue} days overdue
                                                                        </span>
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            <div className="font-bold">{fee.formatted_total}</div>
                                                            {fee.balance > 0 ? (
                                                                <div className="text-sm font-medium text-red-600">
                                                                    Balance: {fee.formatted_balance}
                                                                </div>
                                                            ) : (
                                                                <div className="text-sm font-medium text-green-600">
                                                                    Paid: {fee.formatted_amount_paid}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <StatusBadge status={fee.status} isOverdue={fee.is_overdue} />
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex justify-end gap-1">
                                                            <Link href={`/residentfees/${fee.id}`}>
                                                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                            </Link>
                                                            {fee.balance > 0 && fee.status !== 'cancelled' && (
                                                                <Link href={`/resident/payments/create?fee_id=${fee.id}`}>
                                                                    <Button size="sm" variant="default" className="h-8 px-3 text-xs">
                                                                        Pay
                                                                    </Button>
                                                                </Link>
                                                            )}
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                                                        <MoreVertical className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem onClick={() => {
                                                                        navigator.clipboard.writeText(fee.fee_code);
                                                                        toast.success(`Copied: ${fee.fee_code}`);
                                                                    }}>
                                                                        <Copy className="h-4 w-4 mr-2" />
                                                                        Copy Fee Code
                                                                    </DropdownMenuItem>
                                                                    {fee.or_number && (
                                                                        <DropdownMenuItem onClick={() => {
                                                                            navigator.clipboard.writeText(fee.or_number);
                                                                            toast.success(`Copied OR: ${fee.or_number}`);
                                                                        }}>
                                                                            <Copy className="h-4 w-4 mr-2" />
                                                                            Copy OR Number
                                                                        </DropdownMenuItem>
                                                                    )}
                                                                    <DropdownMenuItem onClick={() => {
                                                                        const reportWindow = window.open('', '_blank');
                                                                        if (reportWindow) {
                                                                            reportWindow.document.write(`
                                                                                <h1>Fee Details: ${fee.fee_code}</h1>
                                                                                <p><strong>Purpose:</strong> ${fee.purpose}</p>
                                                                                <p><strong>Amount:</strong> ${fee.formatted_total}</p>
                                                                                <p><strong>Balance:</strong> ${fee.formatted_balance}</p>
                                                                                <p><strong>Status:</strong> ${fee.status}</p>
                                                                            `);
                                                                        }
                                                                    }}>
                                                                        <FileText className="h-4 w-4 mr-2" />
                                                                        Generate Report
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                            
                            {/* Pagination */}
                            {fees.last_page > 1 && (
                                <div className="mt-4 md:mt-6">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-gray-500">
                                            Page {fees.current_page} of {fees.last_page}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => updateFilters({ page: (fees.current_page - 1).toString() })}
                                                disabled={fees.current_page <= 1 || loading}
                                            >
                                                <ChevronLeft className="h-4 w-4 mr-1" />
                                                Previous
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => updateFilters({ page: (fees.current_page + 1).toString() })}
                                                disabled={fees.current_page >= fees.last_page || loading}
                                            >
                                                Next
                                                <ChevronRight className="h-4 w-4 ml-1" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        );
    };
    
    if (!hasProfile) {
        return (
            <ResidentLayout
                breadcrumbs={[
                    { title: 'Dashboard', href: '/resident/dashboard' },
                    { title: 'My Fees', href: '/residentfees' }
                ]}
            >
                <Head title="My Fees" />
                <div className="min-h-[50vh] flex items-center justify-center px-4">
                    <Card className="w-full max-w-md">
                        <CardContent className="pt-6 text-center">
                            <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                                <AlertCircle className="h-8 w-8 text-amber-600" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Complete Your Profile</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-4">
                                You need to complete your resident profile before you can view fees.
                            </p>
                            <Link href="/resident/profile/create">
                                <Button>
                                    Complete Profile
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </ResidentLayout>
        );
    }
    
    if (pageProps.error) {
        return (
            <ResidentLayout
                breadcrumbs={[
                    { title: 'Dashboard', href: '/resident/dashboard' },
                    { title: 'My Fees', href: '/residentfees' }
                ]}
            >
                <div className="space-y-6">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">My Fees</h1>
                    </div>
                    <Card>
                        <CardContent className="py-12 text-center">
                            <AlertCircle className="h-12 w-12 mx-auto text-red-400" />
                            <h3 className="mt-4 text-lg font-semibold">Error</h3>
                            <p className="text-gray-500 mt-2">
                                {pageProps.error}
                            </p>
                            <Button 
                                className="mt-4"
                                onClick={() => window.location.href = '/dashboard'}
                            >
                                Go to Dashboard
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </ResidentLayout>
        );
    }
    
    return (
        <>
            <Head title="My Fees" />
            
            <ResidentLayout
                breadcrumbs={[
                    { title: 'Dashboard', href: '/resident/dashboard' },
                    { title: 'My Fees', href: '/residentfees' }
                ]}
            >
                <div className="space-y-4 md:space-y-6">
                    {/* Mobile Header */}
                    {isMobile && (
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-xl font-bold">My Fees</h1>
                                <p className="text-xs text-gray-500">
                                    {stats.total_fees} fee{stats.total_fees !== 1 ? 's' : ''} total
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowStats(!showStats)}
                                    className="h-8 px-2"
                                >
                                    {showStats ? (
                                        <ChevronUp className="h-4 w-4" />
                                    ) : (
                                        <ChevronDown className="h-4 w-4" />
                                    )}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowMobileFilters(true)}
                                    className="h-8 px-2 relative"
                                >
                                    <Filter className="h-4 w-4" />
                                    {hasActiveFilters && (
                                        <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}
                    
                    {/* Desktop Header */}
                    {!isMobile && (
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                                    My Fees
                                </h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    View and manage your barangay fees and assessments
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm">
                                            <Download className="h-4 w-4 mr-2" />
                                            Export
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem onClick={exportToCSV} disabled={isExporting}>
                                            <FileText className="h-4 w-4 mr-2" />
                                            {isExporting ? 'Exporting...' : 'Export as CSV'}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={printFees}>
                                            <Printer className="h-4 w-4 mr-2" />
                                            Print List
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => {
                                            const totalPaid = fees.data
                                                .filter(f => f.status === 'paid')
                                                .reduce((sum, f) => sum + (f.amount_paid || 0), 0);
                                            
                                            const summary = `My Fees Summary (${statusFilter}):\n\n` +
                                                `Total Fees: ${fees.data.length}\n` +
                                                `Total Paid: ₱${totalPaid.toFixed(2)}\n` +
                                                `Balance Due: ₱${stats.total_balance.toFixed(2)}\n` +
                                                `Pending: ${getStatusCount('pending')}\n` +
                                                `Overdue: ${getStatusCount('overdue')}\n\n` +
                                                `Generated on: ${new Date().toLocaleDateString()}\n` +
                                                `View online: ${window.location.origin}/residentfees`;
                                            
                                            navigator.clipboard.writeText(summary);
                                            toast.success('Summary copied to clipboard');
                                        }}>
                                            <Share2 className="h-4 w-4 mr-2" />
                                            Copy Summary
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <Button onClick={printFees} variant="outline" size="sm">
                                    <Printer className="h-4 w-4 mr-2" />
                                    Print
                                </Button>
                                
                                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
                                
                                <Link href="/resident/payments/create">
                                    <Button className="gap-2">
                                        <Plus className="h-4 w-4" />
                                        <span>Pay Fee</span>
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    )}
                    
                    {/* Stats */}
                    {showStats && (
                        <CollapsibleStats 
                            showStats={showStats}
                            setShowStats={setShowStats}
                            statusFilter={statusFilter}
                            stats={stats}
                            fees={fees}
                            getStatusCount={getStatusCount}
                            formatCurrency={formatCurrency}
                        />
                    )}
                    {!isMobile && (
                        <DesktopStats 
                            statusFilter={statusFilter}
                            stats={stats}
                            fees={fees}
                            getStatusCount={getStatusCount}
                            formatCurrency={formatCurrency}
                        />
                    )}
                    
                    {/* Desktop Filters */}
                    {!isMobile && (
                        <FiltersSection
                            search={search}
                            setSearch={setSearch}
                            handleSearchSubmit={handleSearchSubmit}
                            handleSearchClear={handleSearchClear}
                            feeTypeFilter={feeTypeFilter}
                            handleFeeTypeChange={handleFeeTypeChange}
                            residentFilter={residentFilter}
                            handleResidentChange={handleResidentChange}
                            yearFilter={yearFilter}
                            handleYearChange={handleYearChange}
                            loading={loading}
                            availableFeeTypes={availableFeeTypes}
                            availableYears={availableYears}
                            householdResidents={householdResidents}
                            printFees={printFees}
                            exportToCSV={exportToCSV}
                            isExporting={isExporting}
                            hasActiveFilters={hasActiveFilters}
                            handleClearFilters={handleClearFilters}
                        />
                    )}
                    
                    {/* Custom Tabs Section */}
                    <div className="mt-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                            <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-100">
                                Fee History
                            </h2>
                            <div className="flex items-center gap-2">
                                <div className="text-sm text-gray-500 dark:text-gray-400 hidden md:block">
                                    Page {fees.current_page} of {fees.last_page}
                                </div>
                            </div>
                        </div>
                        
                        {/* Custom Tabs */}
                        <CustomTabs 
                            statusFilter={statusFilter}
                            handleTabChange={handleTabChange}
                            getStatusCount={getStatusCount}
                        />
                        
                        {/* Tab Content */}
                        <div className="mt-4">
                            {renderTabContent()}
                        </div>
                    </div>
                </div>
                
                {/* Mobile FAB */}
                {isMobile && (
                    <div className="fixed bottom-24 right-6 z-50 safe-bottom">
                        <Link href="/resident/payments/create">
                            <Button 
                                size="lg" 
                                className="rounded-full h-14 w-14 shadow-lg shadow-blue-500/20"
                            >
                                <Plus className="h-6 w-6" />
                            </Button>
                        </Link>
                    </div>
                )}
                
                {/* Mobile Filter Modal */}
                <MobileFilterModal
                    isOpen={showMobileFilters}
                    onClose={() => setShowMobileFilters(false)}
                    search={search}
                    onSearchChange={setSearch}
                    onSearchSubmit={handleSearchSubmit}
                    onSearchClear={handleSearchClear}
                    feeTypeFilter={feeTypeFilter}
                    onFeeTypeChange={handleFeeTypeChange}
                    residentFilter={residentFilter}
                    onResidentChange={handleResidentChange}
                    yearFilter={yearFilter}
                    onYearChange={handleYearChange}
                    loading={loading}
                    availableFeeTypes={availableFeeTypes}
                    availableYears={availableYears}
                    householdResidents={householdResidents}
                    hasActiveFilters={hasActiveFilters}
                    onClearFilters={handleClearFilters}
                />
                
                {/* Loading Overlay */}
                {loading && (
                    <div className="fixed inset-0 bg-black/10 backdrop-blur-sm z-50 flex items-center justify-center">
                        <div className="bg-white p-6 rounded-lg shadow-lg">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                            <p className="text-sm">Loading...</p>
                        </div>
                    </div>
                )}
            </ResidentLayout>
        </>
    );
}