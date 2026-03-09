// pages/resident/Announcements/Index.tsx

import ResidentLayout from '@/layouts/resident-app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect, useMemo, useRef } from 'react';
import { cn } from '@/lib/utils';

// Import icons
import { 
  Bell as BellIcon,
  Search as SearchIcon,
  Calendar as CalendarIcon,
  AlertTriangle as AlertTriangleIcon,
  Wrench as WrenchIcon,
  PartyPopper as PartyPopperIcon,
  Info as InfoIcon,
  ChevronRight as ChevronRightIcon,
  X as XIcon,
  Menu as MenuIcon,
  Filter as FilterIcon,
  Loader2 as LoaderIcon,
  Sparkles as SparklesIcon,
  TrendingUp as TrendingUpIcon,
  Clock as ClockIcon,
  Eye as EyeIcon,
  Bookmark as BookmarkIcon,
  BookOpen as BookOpenIcon,
  Home as HomeIcon,
  Users as UsersIcon,
  Megaphone as MegaphoneIcon,
  CheckCircle as CheckCircleIcon,
  AlertCircle as AlertCircleIcon,
  MapPin as MapPinIcon,
  Briefcase as BriefcaseIcon,
  Globe as GlobeIcon,
  Target as TargetIcon,
  Star as StarIcon,
  Pin as PinIcon,
  Zap as ZapIcon,
  Paperclip as PaperclipIcon,
  FileText as FileTextIcon,
  FileImage as FileImageIcon,
} from 'lucide-react';

// Reusable Components
import { ModernPagination } from '@/components/residentui/modern-pagination';
import { ModernEmptyState } from '@/components/residentui/modern-empty-state';
import { ModernLoadingOverlay } from '@/components/residentui/modern-loading-overlay';

// UI Components
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Constants for announcements
const ANNOUNCEMENT_TYPE_ICONS: Record<string, React.ReactNode> = {
    important: <AlertTriangleIcon className="h-4 w-4" />,
    event: <PartyPopperIcon className="h-4 w-4" />,
    maintenance: <WrenchIcon className="h-4 w-4" />,
    general: <InfoIcon className="h-4 w-4" />,
    other: <MegaphoneIcon className="h-4 w-4" />,
};

const ANNOUNCEMENT_TYPE_COLORS: Record<string, string> = {
    important: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/40',
    event: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-900/40',
    maintenance: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/40',
    general: 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-800',
    other: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800 dark:hover:bg-purple-900/40',
};

const PRIORITY_COLORS: Record<number, string> = {
    0: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
    1: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800',
    2: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950/50 dark:text-yellow-400 dark:border-yellow-800',
    3: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950/50 dark:text-orange-400 dark:border-orange-800',
    4: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800',
};

const PRIORITY_LABELS: Record<number, string> = {
    0: 'Normal',
    1: 'Low',
    2: 'Medium',
    3: 'High',
    4: 'Urgent',
};

const AUDIENCE_ICONS: Record<string, React.ReactNode> = {
    all: <GlobeIcon className="h-3 w-3" />,
    roles: <UsersIcon className="h-3 w-3" />,
    puroks: <MapPinIcon className="h-3 w-3" />,
    households: <HomeIcon className="h-3 w-3" />,
    household_members: <UsersIcon className="h-3 w-3" />,
    businesses: <BriefcaseIcon className="h-3 w-3" />,
    specific_users: <TargetIcon className="h-3 w-3" />,
};

const AUDIENCE_LABELS: Record<string, string> = {
    all: 'Everyone',
    roles: 'Specific Roles',
    puroks: 'Your Purok',
    households: 'Your Household',
    household_members: 'Household Members',
    businesses: 'Business Owners',
    specific_users: 'Personalized',
};

interface AnnouncementAttachment {
    id: number;
    file_name: string;
    original_name: string;
    file_size: number;
    formatted_size: string;
    mime_type: string;
    is_image: boolean;
    created_at: string;
}

interface Announcement {
    id: number;
    title: string;
    excerpt?: string;
    type: string;
    type_label: string;
    priority: number;
    priority_label: string;
    created_at: string;
    updated_at: string;
    start_date?: string | null;
    end_date?: string | null;
    status: string;
    status_label: string;
    status_color: string;
    is_currently_active: boolean;
    audience_type: string;
    audience_summary?: string;
    is_personalized?: boolean;
    views_count?: number;
    has_attachments: boolean;
    attachments_count: number;
    attachments?: AnnouncementAttachment[];
}

interface PageProps {
    announcements: {
        data: Announcement[];
        total: number;
        current_page: number;
        last_page: number;
        from: number;
        to: number;
        per_page: number;
    };
    featuredAnnouncement?: Announcement | null;
    filters: {
        search?: string;
        type?: string;
        priority?: string;
        status?: string;
    };
    types: Record<string, string>;
    priorityOptions: Record<number, string>;
    statusOptions: Record<string, string>;
    stats: {
        total: number;
        active: number;
        unread: number;
        personalized: number;
        with_attachments: number;
    };
}

// Action Status Alert Component
const ActionStatusAlert = ({ type, message }: { type: 'success' | 'error' | 'info' | null; message: string }) => {
    if (!type) return null;

    return (
        <div className="fixed top-16 sm:top-4 right-4 z-50 max-w-xs sm:max-w-sm animate-in slide-in-from-top duration-300">
            <div 
                className={cn(
                    "rounded-lg shadow-lg border p-3",
                    type === 'success' 
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300' 
                        : type === 'info'
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300'
                        : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
                )}
            >
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                    {type === 'success' ? (
                        <CheckCircleIcon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                    ) : type === 'error' ? (
                        <AlertCircleIcon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    ) : (
                        <InfoIcon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                    )}
                    <span className="truncate">{message}</span>
                </div>
            </div>
        </div>
    );
};

// Featured Announcement Component
const FeaturedAnnouncement = ({ announcement }: { announcement: Announcement }) => {
    const typeIcon = ANNOUNCEMENT_TYPE_ICONS[announcement.type] || <MegaphoneIcon className="h-4 w-4" />;
    const typeColor = ANNOUNCEMENT_TYPE_COLORS[announcement.type] || ANNOUNCEMENT_TYPE_COLORS.general;
    const priorityColor = PRIORITY_COLORS[announcement.priority] || PRIORITY_COLORS[0];

    return (
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent overflow-hidden">
            <div className="flex flex-col lg:flex-row">
                <div className="flex-1 p-6">
                    <div className="flex items-center gap-2 mb-3">
                        <Badge className="bg-primary text-primary-foreground gap-1">
                            <StarIcon className="h-3 w-3" />
                            Featured
                        </Badge>
                        <Badge variant="outline" className={cn("gap-1", typeColor)}>
                            {typeIcon}
                            {announcement.type_label}
                        </Badge>
                        <Badge variant="outline" className={cn("gap-1", priorityColor)}>
                            {announcement.priority_label}
                        </Badge>
                        {announcement.has_attachments && (
                            <Badge variant="outline" className="gap-1 bg-blue-50 text-blue-700 border-blue-200">
                                <PaperclipIcon className="h-3 w-3" />
                                {announcement.attachments_count}
                            </Badge>
                        )}
                    </div>
                    
                    <h2 className="text-xl lg:text-2xl font-bold mb-2">{announcement.title}</h2>
                    
                    {announcement.excerpt && (
                        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                            {announcement.excerpt}
                        </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-500">
                        <div className="flex items-center gap-1">
                            <CalendarIcon className="h-3 w-3" />
                            {new Date(announcement.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                            })}
                        </div>
                        {announcement.is_personalized && (
                            <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                                <TargetIcon className="h-3 w-3" />
                                Personalized for you
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="flex items-center justify-end p-6 bg-gradient-to-l from-primary/10 to-transparent">
                    <Link href={`/portal/announcements/${announcement.id}`}>
                        <Button className="gap-2">
                            Read Now
                            <ChevronRightIcon className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </div>
        </Card>
    );
};

export default function AnnouncementsIndex({ 
    announcements: initialAnnouncements, 
    featuredAnnouncement,
    filters,
    types,
    priorityOptions,
    statusOptions,
    stats
}: PageProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedType, setSelectedType] = useState(filters.type || 'all');
    const [selectedPriority, setSelectedPriority] = useState(filters.priority || 'all');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([]);
    
    // Action feedback state
    const [actionStatus, setActionStatus] = useState<{
        type: 'success' | 'error' | 'info' | null;
        message: string;
    }>({ type: null, message: '' });

    // Set mounted to true after hydration
    useEffect(() => {
        setMounted(true);
        
        // Load bookmarks from localStorage
        const saved = localStorage.getItem('announcement_bookmarks');
        if (saved) {
            try {
                setBookmarkedIds(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse bookmarks', e);
            }
        }
    }, []);

    // Check if mobile on mount and resize - ONLY ON CLIENT
    useEffect(() => {
        if (!mounted) return;
        
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, [mounted]);

    // Debounce search input
    useEffect(() => {
        if (!mounted) return;
        
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);

        return () => clearTimeout(timer);
    }, [search, mounted]);

    // Apply filters when debounced search changes
    useEffect(() => {
        if (!mounted) return;
        
        if (debouncedSearch !== filters.search) {
            applyFilters();
        }
    }, [debouncedSearch]);

    const applyFilters = () => {
        if (loading) return;
        
        setLoading(true);
        
        const params: Record<string, string> = {};
        
        if (debouncedSearch) params.search = debouncedSearch;
        if (selectedType !== 'all') params.type = selectedType;
        if (selectedPriority !== 'all') params.priority = selectedPriority;
        if (selectedStatus !== 'all') params.status = selectedStatus;
        
        router.get('/portal/announcements', params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onFinish: () => setLoading(false),
        });
    };

    const handleTypeChange = (value: string) => {
        setSelectedType(value);
        
        setLoading(true);
        
        const params: Record<string, string> = {};
        if (search) params.search = search;
        if (value !== 'all') params.type = value;
        if (selectedPriority !== 'all') params.priority = selectedPriority;
        if (selectedStatus !== 'all') params.status = selectedStatus;
        
        router.get('/portal/announcements', params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onFinish: () => setLoading(false),
        });
        
        setIsFilterSheetOpen(false);
    };

    const handlePriorityChange = (value: string) => {
        setSelectedPriority(value);
        
        setLoading(true);
        
        const params: Record<string, string> = {};
        if (search) params.search = search;
        if (selectedType !== 'all') params.type = selectedType;
        if (value !== 'all') params.priority = value;
        if (selectedStatus !== 'all') params.status = selectedStatus;
        
        router.get('/portal/announcements', params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onFinish: () => setLoading(false),
        });
        
        setIsFilterSheetOpen(false);
    };

    const handleStatusChange = (value: string) => {
        setSelectedStatus(value);
        
        setLoading(true);
        
        const params: Record<string, string> = {};
        if (search) params.search = search;
        if (selectedType !== 'all') params.type = selectedType;
        if (selectedPriority !== 'all') params.priority = selectedPriority;
        if (value !== 'all') params.status = value;
        
        router.get('/portal/announcements', params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onFinish: () => setLoading(false),
        });
        
        setIsFilterSheetOpen(false);
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters();
    };

    const handleSearchClear = () => {
        setSearch('');
        setDebouncedSearch('');
        
        const params: Record<string, string> = {};
        if (selectedType !== 'all') params.type = selectedType;
        if (selectedPriority !== 'all') params.priority = selectedPriority;
        if (selectedStatus !== 'all') params.status = selectedStatus;
        
        router.get('/portal/announcements', params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
        
        setActionStatus({
            type: 'info',
            message: 'Search cleared'
        });
        
        setTimeout(() => {
            setActionStatus({ type: null, message: '' });
        }, 3000);
    };

    const clearFilters = () => {
        setSearch('');
        setDebouncedSearch('');
        setSelectedType('all');
        setSelectedPriority('all');
        setSelectedStatus('all');
        
        router.get('/portal/announcements', {}, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
        
        setActionStatus({
            type: 'success',
            message: 'All filters cleared'
        });
        
        setTimeout(() => {
            setActionStatus({ type: null, message: '' });
        }, 3000);
        
        setIsFilterSheetOpen(false);
    };

    const toggleBookmark = (id: number, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        let newBookmarks: number[];
        if (bookmarkedIds.includes(id)) {
            newBookmarks = bookmarkedIds.filter(bookmarkId => bookmarkId !== id);
            setActionStatus({
                type: 'info',
                message: 'Bookmark removed'
            });
        } else {
            newBookmarks = [...bookmarkedIds, id];
            setActionStatus({
                type: 'success',
                message: 'Bookmark added'
            });
        }
        
        setBookmarkedIds(newBookmarks);
        localStorage.setItem('announcement_bookmarks', JSON.stringify(newBookmarks));
        
        setTimeout(() => {
            setActionStatus({ type: null, message: '' });
        }, 2000);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: diffDays > 365 ? 'numeric' : undefined
        });
    };

    const truncateContent = (content: string, maxLength: number = 120) => {
        if (!content) return '';
        const strippedContent = content.replace(/<[^>]*>/g, '');
        if (strippedContent.length <= maxLength) return strippedContent;
        return strippedContent.substring(0, maxLength) + '...';
    };

    const hasActiveFilters = useMemo(() => {
        return debouncedSearch || selectedType !== 'all' || selectedPriority !== 'all' || selectedStatus !== 'all';
    }, [debouncedSearch, selectedType, selectedPriority, selectedStatus]);

    // Process type options for display
    const typeOptions = useMemo(() => {
        return Object.entries(types).map(([key, value]) => ({
            id: key,
            name: value,
            icon: ANNOUNCEMENT_TYPE_ICONS[key] || <MegaphoneIcon className="h-4 w-4" />,
            color: ANNOUNCEMENT_TYPE_COLORS[key]?.split(' ')[0] || 'bg-gray-500',
        }));
    }, [types]);

    const allTypesOption = {
        id: 'all',
        name: 'All Announcements',
        icon: <MegaphoneIcon className="h-4 w-4" />,
        color: 'bg-blue-500',
    };

    // Get current type for display
    const currentType = useMemo(() => {
        if (selectedType === 'all') return allTypesOption;
        return typeOptions.find(t => t.id === selectedType) || allTypesOption;
    }, [selectedType, typeOptions]);

    // Don't render until after hydration to prevent mismatch
    if (!mounted) {
        return (
            <ResidentLayout
                title="Announcements"
                breadcrumbs={[
                    { title: 'Dashboard', href: '/portal/dashboard' },
                    { title: 'Announcements', href: '#' }
                ]}
            >
                <Head title="Announcements" />
                <div className="min-h-[50vh] flex items-center justify-center">
                    <div className="text-center">
                        <LoaderIcon className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                        <p className="mt-2 text-sm text-gray-500">Loading...</p>
                    </div>
                </div>
            </ResidentLayout>
        );
    }

    return (
        <ResidentLayout
            title="Announcements"
            breadcrumbs={[
                { title: 'Dashboard', href: '/portal/dashboard' },
                { title: 'Announcements', href: '#' }
            ]}
        >
            <Head title="Announcements" />
            
            {/* Action Status Alert */}
            <ActionStatusAlert type={actionStatus.type} message={actionStatus.message} />
            
            <div className="space-y-4 sm:space-y-6 pb-4 sm:pb-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-0">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <SparklesIcon className="h-5 w-5 text-primary dark:text-primary-400" />
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate dark:text-white">
                                Announcements
                            </h1>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            Stay updated with community news
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Stats Badges */}
                        <div className="hidden sm:flex items-center gap-2">
                            {stats.personalized > 0 && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Badge variant="outline" className="text-xs px-2 py-1 bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800">
                                                <TargetIcon className="h-3 w-3 mr-1" />
                                                {stats.personalized} For You
                                            </Badge>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Announcements personalized for you</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                            {stats.unread > 0 && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Badge variant="outline" className="text-xs px-2 py-1 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800">
                                                <EyeIcon className="h-3 w-3 mr-1" />
                                                {stats.unread} Unread
                                            </Badge>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Announcements you haven't read yet</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                            {stats.with_attachments > 0 && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Badge variant="outline" className="text-xs px-2 py-1 bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800">
                                                <PaperclipIcon className="h-3 w-3 mr-1" />
                                                {stats.with_attachments} With Files
                                            </Badge>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Announcements with attachments</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                        </div>
                        
                        {/* Mobile Filter Button */}
                        {isMobile && (
                            <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
                                <SheetTrigger asChild>
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        className="relative dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                                    >
                                        <FilterIcon className="h-4 w-4 mr-2" />
                                        Filters
                                        {hasActiveFilters && (
                                            <span className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full" />
                                        )}
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="bottom" className="h-[80vh] rounded-t-xl dark:bg-gray-900">
                                    <SheetHeader className="mb-4">
                                        <SheetTitle>Filter Announcements</SheetTitle>
                                    </SheetHeader>
                                    
                                    <div className="space-y-6 overflow-y-auto pb-6">
                                        {/* Type Filter */}
                                        <div className="space-y-3">
                                            <Label className="text-sm font-medium">Type</Label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <Button
                                                    variant={selectedType === 'all' ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => handleTypeChange('all')}
                                                    className={cn(
                                                        "h-9 text-xs justify-start",
                                                        selectedType === 'all' 
                                                            ? "bg-primary text-primary-foreground" 
                                                            : "dark:border-gray-700 dark:text-gray-300"
                                                    )}
                                                >
                                                    All
                                                </Button>
                                                {Object.entries(types).map(([key, value]) => (
                                                    <Button
                                                        key={key}
                                                        variant={selectedType === key ? "default" : "outline"}
                                                        size="sm"
                                                        onClick={() => handleTypeChange(key)}
                                                        className={cn(
                                                            "h-9 text-xs justify-start",
                                                            selectedType === key 
                                                                ? ANNOUNCEMENT_TYPE_COLORS[key] 
                                                                : "dark:border-gray-700 dark:text-gray-300"
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            {ANNOUNCEMENT_TYPE_ICONS[key]}
                                                            <span>{value}</span>
                                                        </div>
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Priority Filter */}
                                        <div className="space-y-3">
                                            <Label className="text-sm font-medium">Priority</Label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <Button
                                                    variant={selectedPriority === 'all' ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => handlePriorityChange('all')}
                                                    className={cn(
                                                        "h-9 text-xs justify-start",
                                                        selectedPriority === 'all' 
                                                            ? "bg-primary text-primary-foreground" 
                                                            : "dark:border-gray-700 dark:text-gray-300"
                                                    )}
                                                >
                                                    All
                                                </Button>
                                                {Object.entries(priorityOptions).map(([key, value]) => (
                                                    <Button
                                                        key={key}
                                                        variant={selectedPriority === key ? "default" : "outline"}
                                                        size="sm"
                                                        onClick={() => handlePriorityChange(key)}
                                                        className={cn(
                                                            "h-9 text-xs justify-start",
                                                            selectedPriority === key 
                                                                ? PRIORITY_COLORS[parseInt(key)] 
                                                                : "dark:border-gray-700 dark:text-gray-300"
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <div className={cn(
                                                                "h-2 w-2 rounded-full",
                                                                selectedPriority === key 
                                                                    ? PRIORITY_COLORS[parseInt(key)].split(' ')[0]
                                                                    : "bg-gray-300 dark:bg-gray-600"
                                                            )} />
                                                            {value}
                                                        </div>
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Status Filter */}
                                        <div className="space-y-3">
                                            <Label className="text-sm font-medium">Status</Label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <Button
                                                    variant={selectedStatus === 'all' ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => handleStatusChange('all')}
                                                    className={cn(
                                                        "h-9 text-xs justify-start",
                                                        selectedStatus === 'all' 
                                                            ? "bg-primary text-primary-foreground" 
                                                            : "dark:border-gray-700 dark:text-gray-300"
                                                    )}
                                                >
                                                    All
                                                </Button>
                                                {Object.entries(statusOptions).map(([key, value]) => (
                                                    <Button
                                                        key={key}
                                                        variant={selectedStatus === key ? "default" : "outline"}
                                                        size="sm"
                                                        onClick={() => handleStatusChange(key)}
                                                        className={cn(
                                                            "h-9 text-xs justify-start",
                                                            selectedStatus === key 
                                                                ? key === 'active' 
                                                                    ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-950/50 dark:text-green-400'
                                                                    : key === 'upcoming'
                                                                    ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400'
                                                                    : key === 'expired'
                                                                    ? 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400'
                                                                    : 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400'
                                                                : "dark:border-gray-700 dark:text-gray-300"
                                                        )}
                                                    >
                                                        {value}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Clear Filters Button */}
                                        {hasActiveFilters && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={clearFilters}
                                                className="w-full h-9 text-sm dark:border-gray-700"
                                            >
                                                <XIcon className="h-4 w-4 mr-2" />
                                                Clear All Filters
                                            </Button>
                                        )}
                                    </div>
                                </SheetContent>
                            </Sheet>
                        )}
                        
                        <Badge variant="outline" className="text-sm px-3 py-1.5 bg-white dark:bg-gray-800 shadow-sm dark:border-gray-700">
                            <TrendingUpIcon className="h-3 w-3 mr-1.5 text-gray-600 dark:text-gray-400" />
                            <span className="dark:text-gray-300">{initialAnnouncements.total} Total</span>
                        </Badge>
                    </div>
                </div>

                {/* Search Bar - Always visible */}
                <div className="px-4 sm:px-0">
                    <form onSubmit={handleSearchSubmit} className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <Input
                            type="text"
                            placeholder="Search announcements..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 pr-10 h-11 md:h-12 rounded-lg md:rounded-xl shadow-sm border-gray-200 dark:border-gray-700 focus:border-primary dark:focus:border-primary-400 text-sm md:text-base dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
                            disabled={loading}
                        />
                        {search && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 md:h-8 md:w-8 hover:bg-gray-100 dark:hover:bg-gray-700"
                                onClick={handleSearchClear}
                            >
                                <XIcon className="h-3.5 w-3.5 md:h-4 md:w-4 text-gray-500 dark:text-gray-400" />
                            </Button>
                        )}
                    </form>
                </div>

                {/* Featured Announcement */}
                {featuredAnnouncement && !hasActiveFilters && (
                    <div className="px-4 sm:px-0">
                        <FeaturedAnnouncement announcement={featuredAnnouncement} />
                    </div>
                )}

                {/* Desktop Filters */}
                {!isMobile && (
                    <div className="px-4 sm:px-0 space-y-4">
                        {/* Type Tabs */}
                        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800">
                            <div className="flex gap-1.5 pb-1 min-w-max">
                                <Button
                                    variant={selectedType === 'all' ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => handleTypeChange('all')}
                                    disabled={loading}
                                    className={cn(
                                        "h-8 px-4 text-xs font-medium whitespace-nowrap",
                                        selectedType === 'all' 
                                            ? 'bg-primary text-primary-foreground shadow-sm border-0 rounded-lg dark:bg-primary-600 dark:hover:bg-primary-700' 
                                            : 'bg-white border hover:bg-gray-50 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'
                                    )}
                                >
                                    All Announcements
                                </Button>
                                
                                {Object.entries(types).map(([key, value]) => (
                                    <Button
                                        key={key}
                                        variant={selectedType === key ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => handleTypeChange(key)}
                                        disabled={loading}
                                        className={cn(
                                            "h-8 px-4 text-xs font-medium whitespace-nowrap border rounded-lg",
                                            selectedType === key 
                                                ? 'shadow-sm border-transparent' 
                                                : 'bg-white hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700',
                                            selectedType === key ? ANNOUNCEMENT_TYPE_COLORS[key] : ''
                                        )}
                                    >
                                        <div className="flex items-center gap-1.5">
                                            {ANNOUNCEMENT_TYPE_ICONS[key]}
                                            <span>{value}</span>
                                        </div>
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Priority and Status Filters */}
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Priority:</span>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant={selectedPriority === 'all' ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => handlePriorityChange('all')}
                                        disabled={loading}
                                        className={cn(
                                            "h-8 px-3 text-xs",
                                            selectedPriority === 'all' 
                                                ? "bg-primary text-primary-foreground dark:bg-primary-600 dark:hover:bg-primary-700" 
                                                : "dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                                        )}
                                    >
                                        All
                                    </Button>
                                    {Object.entries(priorityOptions).map(([key, value]) => (
                                        <Button
                                            key={key}
                                            variant={selectedPriority === key ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => handlePriorityChange(key)}
                                            disabled={loading}
                                            className={cn(
                                                "h-8 px-3 text-xs",
                                                selectedPriority === key 
                                                    ? PRIORITY_COLORS[parseInt(key)] 
                                                    : "dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                                            )}
                                        >
                                            {value}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant={selectedStatus === 'all' ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => handleStatusChange('all')}
                                        disabled={loading}
                                        className={cn(
                                            "h-8 px-3 text-xs",
                                            selectedStatus === 'all' 
                                                ? "bg-primary text-primary-foreground dark:bg-primary-600 dark:hover:bg-primary-700" 
                                                : "dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                                        )}
                                    >
                                        All
                                    </Button>
                                    {Object.entries(statusOptions).map(([key, value]) => (
                                        <Button
                                            key={key}
                                            variant={selectedStatus === key ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => handleStatusChange(key)}
                                            disabled={loading}
                                            className={cn(
                                                "h-8 px-3 text-xs",
                                                selectedStatus === key 
                                                    ? key === 'active' 
                                                        ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-950/50 dark:text-green-400'
                                                        : key === 'upcoming'
                                                        ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400'
                                                        : key === 'expired'
                                                        ? 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400'
                                                        : 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400'
                                                    : "dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                                            )}
                                        >
                                            {value}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Active filters indicator */}
                {hasActiveFilters && (
                    <div className="px-4 sm:px-0">
                        <div className="flex flex-wrap items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                            <FilterIcon className="h-3 w-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Active filters:</span>
                            
                            {debouncedSearch && (
                                <Badge variant="secondary" className="flex items-center gap-1 text-xs px-2 py-0.5 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800">
                                    <span className="truncate max-w-[100px]">Search: "{debouncedSearch}"</span>
                                    <button 
                                        onClick={handleSearchClear}
                                        className="ml-1 hover:text-blue-900 dark:hover:text-blue-300"
                                    >
                                        <XIcon className="h-2.5 w-2.5" />
                                    </button>
                                </Badge>
                            )}
                            
                            {selectedType !== 'all' && (
                                <Badge variant="secondary" className={cn("flex items-center gap-1 text-xs px-2 py-0.5", ANNOUNCEMENT_TYPE_COLORS[selectedType])}>
                                    <span className="truncate max-w-[80px]">{types[selectedType]}</span>
                                    <button 
                                        onClick={() => handleTypeChange('all')}
                                        className="ml-1 hover:opacity-70"
                                    >
                                        <XIcon className="h-2.5 w-2.5" />
                                    </button>
                                </Badge>
                            )}
                            
                            {selectedPriority !== 'all' && (
                                <Badge variant="secondary" className={cn("flex items-center gap-1 text-xs px-2 py-0.5", PRIORITY_COLORS[parseInt(selectedPriority)])}>
                                    <span className="truncate max-w-[80px]">{priorityOptions[parseInt(selectedPriority)]}</span>
                                    <button 
                                        onClick={() => handlePriorityChange('all')}
                                        className="ml-1 hover:opacity-70"
                                    >
                                        <XIcon className="h-2.5 w-2.5" />
                                    </button>
                                </Badge>
                            )}

                            {selectedStatus !== 'all' && (
                                <Badge variant="secondary" className={cn(
                                    "flex items-center gap-1 text-xs px-2 py-0.5",
                                    selectedStatus === 'active' 
                                        ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-950/50 dark:text-green-400'
                                        : selectedStatus === 'upcoming'
                                        ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400'
                                        : 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400'
                                )}>
                                    <span className="truncate max-w-[80px]">{statusOptions[selectedStatus]}</span>
                                    <button 
                                        onClick={() => handleStatusChange('all')}
                                        className="ml-1 hover:opacity-70"
                                    >
                                        <XIcon className="h-2.5 w-2.5" />
                                    </button>
                                </Badge>
                            )}
                            
                            <button 
                                onClick={clearFilters}
                                className="text-primary dark:text-primary-400 text-xs font-medium hover:underline ml-auto"
                                disabled={loading}
                            >
                                Clear all
                            </button>
                        </div>
                    </div>
                )}

                {/* Results Summary */}
                <div className="px-4 sm:px-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                            <span className="font-medium dark:text-white">{initialAnnouncements.total}</span> announcement{initialAnnouncements.total !== 1 ? 's' : ''} found
                            {selectedType !== 'all' && (
                                <span> in <span className="font-medium dark:text-white">{types[selectedType]}</span></span>
                            )}
                            {stats.personalized > 0 && (
                                <span className="ml-2 inline-flex items-center gap-1 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full dark:bg-purple-950/50 dark:text-purple-400">
                                    <TargetIcon className="h-3 w-3" />
                                    {stats.personalized} personalized for you
                                </span>
                            )}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Showing {initialAnnouncements.from} to {initialAnnouncements.to} of {initialAnnouncements.total}
                        </div>
                    </div>
                </div>

                {/* Announcements Grid */}
                <div className="px-4 sm:px-0">
                    {initialAnnouncements.data.length > 0 ? (
                        <>
                            {/* Cards Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                                {initialAnnouncements.data.map((announcement) => {
                                    const typeIcon = ANNOUNCEMENT_TYPE_ICONS[announcement.type] || <MegaphoneIcon className="h-4 w-4" />;
                                    const typeColor = ANNOUNCEMENT_TYPE_COLORS[announcement.type] || ANNOUNCEMENT_TYPE_COLORS.general;
                                    const priorityColor = PRIORITY_COLORS[announcement.priority] || PRIORITY_COLORS[0];
                                    const isBookmarked = bookmarkedIds.includes(announcement.id);
                                    const AudienceIcon = AUDIENCE_ICONS[announcement.audience_type] || GlobeIcon;
                                    
                                    return (
                                        <Card 
                                            key={announcement.id} 
                                            className="group hover:shadow-lg transition-all duration-300 border shadow-sm hover:-translate-y-0.5 cursor-pointer overflow-hidden dark:bg-gray-800 dark:border-gray-700 dark:hover:shadow-gray-900/50"
                                        >
                                            {/* Type Indicator Bar */}
                                            <div className={cn("h-0.5 w-full", typeColor.split(' ')[0] || 'bg-gray-500')} />
                                            
                                            <CardHeader className="pb-2 pt-3 px-4">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="flex items-center gap-1">
                                                            {typeIcon}
                                                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 capitalize">
                                                                {announcement.type_label}
                                                            </span>
                                                        </div>
                                                        {announcement.has_attachments && (
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <div className="text-blue-600 dark:text-blue-400">
                                                                            <PaperclipIcon className="h-3 w-3" />
                                                                        </div>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>{announcement.attachments_count} attachment{announcement.attachments_count !== 1 ? 's' : ''}</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        )}
                                                        {announcement.is_personalized && (
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <div className="text-purple-600 dark:text-purple-400">
                                                                            <TargetIcon className="h-3 w-3" />
                                                                        </div>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>Personalized for you</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        )}
                                                        {announcement.audience_type !== 'all' && (
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <div className="text-blue-600 dark:text-blue-400">
                                                                            <AudienceIcon className="h-3 w-3" />
                                                                        </div>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>{announcement.audience_summary || AUDIENCE_LABELS[announcement.audience_type]}</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        )}
                                                    </div>
                                                    <Badge 
                                                        variant="outline" 
                                                        className={cn("text-[10px] px-1.5 py-0 h-5", priorityColor)}
                                                    >
                                                        {announcement.priority_label}
                                                    </Badge>
                                                </div>
                                                <CardTitle className="text-base line-clamp-2 font-semibold group-hover:text-primary dark:group-hover:text-primary-400 transition-colors dark:text-gray-100">
                                                    {announcement.title}
                                                </CardTitle>
                                                <CardDescription className="mt-1">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                                            <CalendarIcon className="h-3 w-3 mr-1 flex-shrink-0" />
                                                            <span className="truncate">
                                                                {formatDate(announcement.created_at)}
                                                            </span>
                                                        </div>
                                                        {announcement.views_count !== undefined && (
                                                            <div className="flex items-center text-xs text-gray-400 dark:text-gray-500">
                                                                <EyeIcon className="h-3 w-3 mr-1" />
                                                                {announcement.views_count}
                                                            </div>
                                                        )}
                                                    </div>
                                                </CardDescription>
                                            </CardHeader>
                                            
                                            <CardContent className="pb-3 px-4">
                                                <div className="text-gray-600 dark:text-gray-300 line-clamp-2 text-sm leading-relaxed">
                                                    {announcement.excerpt || truncateContent(announcement.content || '', 100)}
                                                </div>
                                            </CardContent>
                                            
                                            <CardFooter className="pt-0 px-4 pb-3">
                                                <div className="flex items-center gap-2 w-full">
                                                    <Link 
                                                        href={`/portal/announcements/${announcement.id}`} 
                                                        className="flex-1"
                                                    >
                                                        <Button 
                                                            variant="ghost" 
                                                            size="sm"
                                                            className="w-full justify-between text-primary hover:text-primary/80 hover:bg-primary/5 dark:text-primary-400 dark:hover:text-primary-300 dark:hover:bg-primary-950/30 text-sm"
                                                        >
                                                            <span className="font-medium">View Details</span>
                                                            <ChevronRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-gray-500 hover:text-yellow-500 dark:text-gray-400 dark:hover:text-yellow-400"
                                                        onClick={(e) => toggleBookmark(announcement.id, e)}
                                                    >
                                                        <BookmarkIcon className={cn("h-4 w-4", isBookmarked && "fill-current text-yellow-500")} />
                                                    </Button>
                                                </div>
                                            </CardFooter>
                                        </Card>
                                    );
                                })}
                            </div>
                            
                            {/* Pagination */}
                            {initialAnnouncements.last_page > 1 && (
                                <div className="mt-6 pt-6 border-t dark:border-gray-800">
                                    <ModernPagination
                                        currentPage={initialAnnouncements.current_page}
                                        lastPage={initialAnnouncements.last_page}
                                        onPageChange={(page) => {
                                            const params: Record<string, string> = {};
                                            if (search) params.search = search;
                                            if (selectedType !== 'all') params.type = selectedType;
                                            if (selectedPriority !== 'all') params.priority = selectedPriority;
                                            if (selectedStatus !== 'all') params.status = selectedStatus;
                                            params.page = page.toString();
                                            
                                            router.get('/portal/announcements', params, {
                                                preserveState: true,
                                                preserveScroll: true,
                                            });
                                        }}
                                        loading={loading}
                                    />
                                </div>
                            )}
                        </>
                    ) : (
                        <ModernEmptyState
                            status={hasActiveFilters ? 'filtered' : 'all'}
                            hasFilters={hasActiveFilters}
                            onClearFilters={clearFilters}
                            icon={MegaphoneIcon}
                            title={debouncedSearch 
                                ? `No announcements match your search "${debouncedSearch}"` 
                                : selectedType !== 'all' 
                                    ? `No announcements found in ${types[selectedType] || 'this category'}`
                                    : 'No announcements found'}
                            message={hasActiveFilters
                                ? 'Try adjusting your filters or clear them to see all announcements'
                                : 'Check back later for new announcements'}
                        />
                    )}
                </div>
            </div>

            {/* Loading Overlay */}
            <ModernLoadingOverlay loading={loading} message="Loading announcements..." />
        </ResidentLayout>
    );
}