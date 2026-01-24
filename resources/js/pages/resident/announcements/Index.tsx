import React, { useState, useEffect, useCallback } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { PaginatedAnnouncements, FilterOptions } from '@/types/announcement';
import ResidentLayout from '@/layouts/resident-app-layout';
import { 
    Card, 
    CardContent, 
    CardHeader, 
    CardTitle, 
    CardDescription,
    CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
    Search, 
    Filter, 
    Bell, 
    Calendar, 
    AlertTriangle,
    Wrench,
    PartyPopper,
    Info,
    ChevronRight,
    X,
    Loader2,
    Sparkles,
    TrendingUp,
    Check
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { route } from 'ziggy-js';
import debounce from 'lodash/debounce';

interface PageProps {
    announcements: PaginatedAnnouncements;
    filters: FilterOptions;
    types: Record<string, string>;
    priorityOptions: Record<number, string>;
}

const Index: React.FC = () => {
    const { announcements, filters, types, priorityOptions } = usePage<PageProps>().props;
    const [search, setSearch] = useState(filters.search || '');
    const [selectedType, setSelectedType] = useState(filters.type || 'all');
    const [selectedPriority, setSelectedPriority] = useState(filters.priority || 'all');
    const [isFiltering, setIsFiltering] = useState(false);
    const [showMobilePriority, setShowMobilePriority] = useState(false);

    const typeIcons: Record<string, React.ReactNode> = {
        important: <AlertTriangle className="h-3.5 w-3.5 text-red-500" />,
        event: <PartyPopper className="h-3.5 w-3.5 text-green-500" />,
        maintenance: <Wrench className="h-3.5 w-3.5 text-blue-500" />,
        general: <Info className="h-3.5 w-3.5 text-gray-500" />,
        other: <Bell className="h-3.5 w-3.5 text-purple-500" />,
    };

    const typeColors: Record<string, string> = {
        important: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
        event: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
        maintenance: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
        general: 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100',
        other: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
    };

    const priorityColors: Record<number, string> = {
        0: 'bg-gray-100 text-gray-800 border-gray-200',
        1: 'bg-blue-100 text-blue-800 border-blue-200',
        2: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        3: 'bg-orange-100 text-orange-800 border-orange-200',
        4: 'bg-red-100 text-red-800 border-red-200',
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: diffDays > 365 ? 'numeric' : undefined
        });
    };

    const truncateContent = (content: string, maxLength: number = 120) => {
        const strippedContent = content.replace(/<[^>]*>/g, '');
        if (strippedContent.length <= maxLength) return strippedContent;
        return strippedContent.substring(0, maxLength) + '...';
    };

    const applyFilters = useCallback((priority: string = selectedPriority) => {
        if (isFiltering) return;
        
        setIsFiltering(true);
        
        router.get(route('resident.announcements.index'), {
            search: search || undefined,
            type: selectedType !== 'all' ? selectedType : undefined,
            priority: priority !== 'all' ? priority : undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => {
                setIsFiltering(false);
                setShowMobilePriority(false);
            },
        });
    }, [search, selectedType, selectedPriority, isFiltering]);

    const debouncedSearch = useCallback(
        debounce((value: string) => {
            if (isFiltering) return;
            
            setIsFiltering(true);
            
            router.get(route('resident.announcements.index'), {
                search: value || undefined,
                type: selectedType !== 'all' ? selectedType : undefined,
                priority: selectedPriority !== 'all' ? selectedPriority : undefined,
            }, {
                preserveState: true,
                preserveScroll: true,
                onFinish: () => {
                    setIsFiltering(false);
                },
            });
        }, 500),
        [selectedType, selectedPriority, isFiltering]
    );

    const clearFilters = () => {
        setSearch('');
        setSelectedType('all');
        setSelectedPriority('all');
        setShowMobilePriority(false);
        
        router.get(route('resident.announcements.index'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Handle search input changes
    useEffect(() => {
        if (search !== filters.search) {
            debouncedSearch(search);
        }
        
        return () => {
            debouncedSearch.cancel();
        };
    }, [search]);

    // Handle type filter changes
    useEffect(() => {
        if (selectedType !== (filters.type || 'all')) {
            applyFilters();
        }
    }, [selectedType]);

    const hasActiveFilters = search || selectedType !== 'all' || selectedPriority !== 'all';

    const handlePriorityChange = (value: string) => {
        setSelectedPriority(value);
        applyFilters(value);
    };

    const handleTypeChange = (type: string) => {
        setSelectedType(type);
    };

    return (
        <ResidentLayout>
            <Head title="Announcements" />

            <div className="container mx-auto px-4 py-6 md:py-8">
                {/* Modern Header */}
                <div className="mb-6 md:mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="h-5 w-5 text-primary" />
                                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                                    Announcements
                                </h1>
                            </div>
                            <p className="text-gray-600 text-sm md:text-base">
                                Stay updated with community news
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Badge variant="outline" className="text-sm px-3 py-1.5 bg-white shadow-sm">
                                <TrendingUp className="h-3 w-3 mr-1.5" />
                                {announcements.total} Total
                            </Badge>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="relative mb-4 md:mb-6">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Search announcements..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 pr-10 h-11 md:h-12 rounded-lg md:rounded-xl shadow-sm border-gray-200 focus:border-primary text-sm md:text-base"
                            disabled={isFiltering}
                        />
                        {search && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 md:h-8 md:w-8"
                                onClick={() => setSearch('')}
                            >
                                <X className="h-3.5 w-3.5 md:h-4 md:w-4" />
                            </Button>
                        )}
                    </div>

                    {/* Filter Section */}
                    <div className="mb-4 md:mb-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                                Filter announcements
                            </h3>
                            
                            {/* Mobile Priority Filter Button */}
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 px-3 md:hidden"
                                onClick={() => setShowMobilePriority(!showMobilePriority)}
                            >
                                <Filter className="h-3.5 w-3.5 mr-1.5" />
                                <span className="text-xs">Priority Filter</span>
                                {selectedPriority !== 'all' && (
                                    <div className="ml-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
                                )}
                            </Button>
                            
                            {/* Desktop Priority Filter */}
                            <div className="hidden md:flex items-center gap-2">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <span>Filter by:</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant={selectedPriority === 'all' ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => handlePriorityChange('all')}
                                        disabled={isFiltering}
                                        className="h-9 px-4 text-sm"
                                    >
                                        All Priorities
                                    </Button>
                                    {Object.entries(priorityOptions).map(([key, value]) => (
                                        <Button
                                            key={key}
                                            variant={selectedPriority === key ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => handlePriorityChange(key)}
                                            disabled={isFiltering}
                                            className={`h-9 px-4 text-sm ${
                                                selectedPriority === key ? priorityColors[parseInt(key)] : ''
                                            }`}
                                        >
                                            {value}
                                        </Button>
                                    ))}
                                </div>
                                
                                {hasActiveFilters && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearFilters}
                                        className="h-9 text-sm"
                                        disabled={isFiltering}
                                    >
                                        <X className="h-3.5 w-3.5 mr-1.5" />
                                        Clear All
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Mobile Priority Options (Shown when button is clicked) */}
                        {showMobilePriority && (
                            <div className="md:hidden mb-4 p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-xs font-medium text-gray-700">Select Priority</h4>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={() => setShowMobilePriority(false)}
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button
                                        variant={selectedPriority === 'all' ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => handlePriorityChange('all')}
                                        disabled={isFiltering}
                                        className="h-9 text-xs justify-start"
                                    >
                                        All Priorities
                                    </Button>
                                    {Object.entries(priorityOptions).map(([key, value]) => (
                                        <Button
                                            key={key}
                                            variant={selectedPriority === key ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => handlePriorityChange(key)}
                                            disabled={isFiltering}
                                            className={`h-9 text-xs justify-start ${
                                                selectedPriority === key ? priorityColors[parseInt(key)] : ''
                                            }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className={`h-2 w-2 rounded-full ${
                                                    priorityColors[parseInt(key)].split(' ')[0]
                                                }`} />
                                                {value}
                                            </div>
                                        </Button>
                                    ))}
                                </div>
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={clearFilters}
                                        className="w-full h-9 text-xs"
                                        disabled={!hasActiveFilters || isFiltering}
                                    >
                                        <X className="h-3.5 w-3.5 mr-1.5" />
                                        Clear All Filters
                                    </Button>
                                </div>
                            </div>
                        )}
                        
                        {/* Type Tabs */}
                        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                            <div className="flex gap-1.5 pb-1 min-w-max">
                                <Button
                                    variant={selectedType === 'all' ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => handleTypeChange('all')}
                                    disabled={isFiltering}
                                    className={`
                                        h-8 px-4 text-xs font-medium whitespace-nowrap
                                        ${selectedType === 'all' 
                                            ? 'bg-primary text-primary-foreground shadow-sm border-0 rounded-lg' 
                                            : 'bg-white border hover:bg-gray-50 rounded-lg'
                                        }
                                    `}
                                >
                                    All Announcements
                                </Button>
                                
                                {Object.entries(types).map(([key, value]) => (
                                    <Button
                                        key={key}
                                        variant={selectedType === key ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => handleTypeChange(key)}
                                        disabled={isFiltering}
                                        className={`
                                            h-8 px-4 text-xs font-medium whitespace-nowrap border rounded-lg
                                            ${selectedType === key 
                                                ? 'shadow-sm border-transparent' 
                                                : 'bg-white hover:bg-gray-50'
                                            }
                                            ${selectedType === key ? typeColors[key] : ''}
                                        `}
                                    >
                                        <div className="flex items-center gap-1.5">
                                            {typeIcons[key]}
                                            <span>{value}</span>
                                        </div>
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Active Filters Indicator - Compact */}
                    {hasActiveFilters && (
                        <div className="flex flex-wrap items-center gap-2 mb-4 text-xs text-gray-600 bg-gray-50 rounded-lg p-2">
                            <Filter className="h-3 w-3 flex-shrink-0" />
                            <span className="font-medium">Active filters:</span>
                            <div className="flex flex-wrap gap-1.5">
                                {search && (
                                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 text-xs px-2 py-0.5">
                                        Search: "{search}"
                                        <button 
                                            onClick={() => setSearch('')}
                                            className="ml-1 hover:text-blue-900"
                                            disabled={isFiltering}
                                        >
                                            <X className="h-2.5 w-2.5" />
                                        </button>
                                    </Badge>
                                )}
                                {selectedType !== 'all' && (
                                    <Badge variant="secondary" className={`text-xs px-2 py-0.5 ${typeColors[selectedType]}`}>
                                        {types[selectedType]}
                                        <button 
                                            onClick={() => handleTypeChange('all')}
                                            className="ml-1 hover:opacity-70"
                                            disabled={isFiltering}
                                        >
                                            <X className="h-2.5 w-2.5" />
                                        </button>
                                    </Badge>
                                )}
                                {selectedPriority !== 'all' && (
                                    <Badge variant="secondary" className={`text-xs px-2 py-0.5 ${priorityColors[parseInt(selectedPriority)]}`}>
                                        {priorityOptions[parseInt(selectedPriority)]}
                                        <button 
                                            onClick={() => handlePriorityChange('all')}
                                            className="ml-1 hover:opacity-70"
                                            disabled={isFiltering}
                                        >
                                            <X className="h-2.5 w-2.5" />
                                        </button>
                                    </Badge>
                                )}
                            </div>
                            <button 
                                onClick={clearFilters}
                                className="text-primary text-xs font-medium hover:underline ml-auto"
                                disabled={isFiltering}
                            >
                                Clear all
                            </button>
                        </div>
                    )}
                </div>

                {/* Loading State */}
                {isFiltering && (
                    <div className="flex justify-center items-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-primary mr-3" />
                        <span className="text-gray-600 text-sm">Loading...</span>
                    </div>
                )}

                {/* Announcements Grid */}
                {!isFiltering && announcements.data.length === 0 ? (
                    <div className="text-center py-8 md:py-12">
                        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                            <Bell className="h-6 w-6 text-gray-400" />
                        </div>
                        <h3 className="text-base font-semibold text-gray-900 mb-2">No announcements found</h3>
                        <p className="text-gray-600 text-sm mb-6 max-w-md mx-auto">
                            {hasActiveFilters
                                ? 'No results match your current filters.'
                                : 'No announcements available.'}
                        </p>
                        {hasActiveFilters && (
                            <Button onClick={clearFilters} variant="outline" size="sm">
                                Clear All Filters
                            </Button>
                        )}
                    </div>
                ) : !isFiltering && (
                    <>
                        {/* Results Count */}
                        <div className="mb-3 text-xs text-gray-600 font-medium">
                            Showing <span className="text-primary">{announcements.data.length}</span> of {announcements.total} announcements
                        </div>

                        {/* Cards Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-6">
                            {announcements.data.map((announcement) => (
                                <Card 
                                    key={announcement.id} 
                                    className="group hover:shadow-lg transition-all duration-300 border shadow-sm hover:-translate-y-0.5 cursor-pointer overflow-hidden"
                                >
                                    {/* Type Indicator Bar */}
                                    <div className={`h-0.5 w-full ${typeColors[announcement.type].split(' ')[0]}`} />
                                    
                                    <CardHeader className="pb-2 pt-3 px-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-1.5">
                                                <div className="flex items-center gap-1">
                                                    {typeIcons[announcement.type]}
                                                    <span className="text-xs font-medium text-gray-600 capitalize">
                                                        {announcement.type}
                                                    </span>
                                                </div>
                                            </div>
                                            <Badge 
                                                variant="outline" 
                                                className={`text-[10px] px-1.5 py-0 h-5 ${priorityColors[announcement.priority]}`}
                                            >
                                                {priorityOptions[announcement.priority]}
                                            </Badge>
                                        </div>
                                        <CardTitle className="text-base line-clamp-2 font-semibold group-hover:text-primary transition-colors">
                                            {announcement.title}
                                        </CardTitle>
                                        <CardDescription className="mt-1">
                                            <div className="flex items-center text-xs text-gray-500">
                                                <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                                                <span className="truncate">
                                                    {formatDate(announcement.created_at)}
                                                </span>
                                            </div>
                                        </CardDescription>
                                    </CardHeader>
                                    
                                    <CardContent className="pb-3 px-4">
                                        <div className="text-gray-600 line-clamp-2 text-sm leading-relaxed">
                                            {truncateContent(announcement.content, 100)}
                                        </div>
                                    </CardContent>
                                    
                                    <CardFooter className="pt-0 px-4 pb-3">
                                        <Link 
                                            href={route('resident.announcements.show', announcement.id)} 
                                            className="w-full"
                                        >
                                            <Button 
                                                variant="ghost" 
                                                size="sm"
                                                className="w-full justify-between text-primary hover:text-primary/80 hover:bg-primary/5 text-sm"
                                            >
                                                <span className="font-medium">View Details</span>
                                                <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                                            </Button>
                                        </Link>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>

                        {/* Compact Pagination */}
                        {announcements.last_page > 1 && (
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t">
                                <div className="text-xs text-gray-600">
                                    Page {announcements.current_page} of {announcements.last_page}
                                </div>
                                <div className="flex items-center gap-1">
                                    {announcements.links.map((link, index) => (
                                        link.url && (
                                            <Link
                                                key={index}
                                                href={link.url}
                                                preserveScroll
                                                className={`
                                                    min-w-[32px] h-8 flex items-center justify-center rounded-md
                                                    transition-all duration-200 font-medium text-xs
                                                    ${link.active
                                                        ? 'bg-primary text-white'
                                                        : 'bg-white text-gray-700 hover:bg-gray-50 border'
                                                    }
                                                    ${link.label.includes('Previous') || link.label.includes('Next')
                                                        ? 'px-3 text-sm'
                                                        : ''
                                                    }
                                                `}
                                                disabled={isFiltering}
                                            >
                                                {link.label.includes('Previous') ? (
                                                    <span className="flex items-center">
                                                        &larr;
                                                    </span>
                                                ) : link.label.includes('Next') ? (
                                                    <span className="flex items-center">
                                                        &rarr;
                                                    </span>
                                                ) : (
                                                    <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                                )}
                                            </Link>
                                        )
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </ResidentLayout>
    );
};

export default Index;