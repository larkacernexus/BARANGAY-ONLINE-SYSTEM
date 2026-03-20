import { Search, X, User, Home, FileText, Shield, Building, Users, Briefcase, Calendar, Loader2, ArrowRight, History, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { type ReactNode, useState, useRef, useEffect, useMemo } from 'react';
import { router } from '@inertiajs/react';

export interface SearchResult {
  id: string;
  title: string;
  type: 'resident' | 'household' | 'clearance' | 'user' | 'blotter' | 'ordinance' | 'business' | 'event' | 'document';
  path: string;
  description?: string;
  badge?: string;
  icon?: ReactNode;
}

interface BarangaySearchModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSearch?: (query: string) => Promise<SearchResult[]> | SearchResult[];
  onSearchResultClick?: (result: SearchResult) => void;
}

const SEARCH_CATEGORIES = [
  { 
    type: 'resident', 
    label: 'Residents', 
    icon: User, 
    color: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    accent: 'bg-blue-100 dark:bg-blue-900'
  },
  { 
    type: 'household', 
    label: 'Households', 
    icon: Home, 
    color: 'bg-green-500/10 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
    accent: 'bg-green-100 dark:bg-green-900'
  },
  { 
    type: 'clearance', 
    label: 'Clearances', 
    icon: FileText, 
    color: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    accent: 'bg-purple-100 dark:bg-purple-900'
  },
  { 
    type: 'blotter', 
    label: 'Blotters', 
    icon: Shield, 
    color: 'bg-red-500/10 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
    accent: 'bg-red-100 dark:bg-red-900'
  },
  { 
    type: 'ordinance', 
    label: 'Ordinances', 
    icon: Building, 
    color: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    accent: 'bg-amber-100 dark:bg-amber-900'
  },
  { 
    type: 'business', 
    label: 'Businesses', 
    icon: Briefcase, 
    color: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    accent: 'bg-indigo-100 dark:bg-indigo-900'
  },
  { 
    type: 'event', 
    label: 'Events', 
    icon: Calendar, 
    content: 'bg-pink-500/10 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800',
    accent: 'bg-pink-100 dark:bg-pink-900'
  },
  { 
    type: 'user', 
    label: 'Users', 
    icon: Users, 
    color: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
    accent: 'bg-cyan-100 dark:bg-cyan-900'
  },
];

const RECENT_SEARCHES = [
  { query: 'New residents 2024', type: 'resident' },
  { query: 'Business permits', type: 'business' },
  { query: 'Community events', type: 'event' },
  { query: 'Clearance requests', type: 'clearance' },
];

const QUICK_ACTIONS = [
  { label: 'New Resident', icon: User, path: '/residents/create', color: 'bg-blue-500' },
  { label: 'New Clearance', icon: FileText, path: '/clearances/create', color: 'bg-purple-500' },
  { label: 'New Blotter', icon: Shield, path: '/blotters/create', color: 'bg-red-500' },
  { label: 'New Business', icon: Briefcase, path: '/businesses/create', color: 'bg-indigo-500' },
];

const SearchResultSkeleton = () => (
  <div className="flex items-start gap-4 p-4 rounded-xl border border-border/50 animate-pulse">
    <Skeleton className="h-10 w-10 rounded-lg" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-3 w-32" />
      <div className="flex gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-24 rounded-full" />
      </div>
    </div>
  </div>
);

export function BarangaySearchModal({
  isOpen,
  onOpenChange,
  onSearch,
  onSearchResultClick,
}: BarangaySearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [recentSearches, setRecentSearches] = useState(RECENT_SEARCHES);
  const [contentKey, setContentKey] = useState(0); // For CSS transitions
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredResults = useMemo(() => {
    if (activeCategory === 'all') return searchResults;
    return searchResults.filter(result => result.type === activeCategory);
  }, [searchResults, activeCategory]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (!value.trim() || !onSearch) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    setContentKey(prev => prev + 1); // Force content transition
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await onSearch(value);
        setSearchResults(results);
      } catch (error) {
        console.error('Search failed:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 350);
  };

  const handleSearchResultClick = (result: SearchResult) => {
    // Add to recent searches
    if (!recentSearches.some(s => s.query === searchQuery)) {
      setRecentSearches(prev => [
        { query: searchQuery, type: result.type },
        ...prev.slice(0, 3)
      ]);
    }

    if (onSearchResultClick) {
      onSearchResultClick(result);
    } else {
      router.visit(result.path);
    }
    onOpenChange(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleCategoryClick = (category: string) => {
    setActiveCategory(category);
    setContentKey(prev => prev + 1); // Force content transition
  };

  const handleRecentSearch = (query: string, type: string) => {
    setSearchQuery(query);
    setActiveCategory(type);
    setContentKey(prev => prev + 1); // Force content transition
    if (onSearch) {
      setIsSearching(true);
      setTimeout(async () => {
        try {
          const results = await onSearch(query);
          setSearchResults(results);
        } catch (error) {
          console.error('Search failed:', error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      }, 150);
    }
  };

  const handleQuickAction = (path: string) => {
    router.visit(path);
    onOpenChange(false);
  };

  // Auto-focus input when modal opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen) {
        if (e.key === 'Escape') {
          e.preventDefault();
          onOpenChange(false);
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
          e.preventDefault();
          onOpenChange(!isOpen);
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onOpenChange(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onOpenChange]);

  const getCategoryIcon = (type: SearchResult['type']) => {
    const category = SEARCH_CATEGORIES.find(cat => cat.type === type);
    return category?.icon || Search;
  };

  const getCategoryColor = (type: SearchResult['type']) => {
    const category = SEARCH_CATEGORIES.find(cat => cat.type === type);
    return category?.color || 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700';
  };

  const getCategoryAccent = (type: SearchResult['type']) => {
    const category = SEARCH_CATEGORIES.find(cat => cat.type === type);
    return category?.accent || 'bg-gray-100 dark:bg-gray-900';
  };

  const getCategoryLabel = (type: SearchResult['type']) => {
    const category = SEARCH_CATEGORIES.find(cat => cat.type === type);
    return category?.label || type;
  };

  const getCategoryData = (type: string) => {
    return SEARCH_CATEGORIES.find(cat => cat.type === type);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (filteredResults.length > 0) {
      handleSearchResultClick(filteredResults[0]);
    }
  };

  // Render content based on state
  const renderContent = () => {
    if (isSearching) {
      return (
        <div key={`loading-${contentKey}`} className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent animate-pulse rounded-full" />
            </div>
          </div>
          <div className="space-y-3">
            <SearchResultSkeleton />
            <SearchResultSkeleton />
            <SearchResultSkeleton />
          </div>
        </div>
      );
    }

    if (filteredResults.length > 0) {
      return (
        <div key={`results-${contentKey}`} className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-foreground">
                Search Results
              </h3>
              <Badge variant="secondary" className="font-medium">
                {filteredResults.length} found
              </Badge>
            </div>
            {activeCategory !== 'all' && getCategoryData(activeCategory) && (
              <Badge variant="outline" className="gap-1.5">
                {(() => {
                  const IconComponent = getCategoryData(activeCategory)?.icon;
                  return IconComponent ? <IconComponent className="h-3 w-3" /> : null;
                })()}
                {getCategoryLabel(activeCategory as any)}
              </Badge>
            )}
          </div>
          
          <div className="space-y-3">
            {filteredResults.map((result, index) => {
              const Icon = getCategoryIcon(result.type);
              return (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleSearchResultClick(result)}
                  className="w-full text-left p-4 rounded-xl hover:bg-gradient-to-r from-accent/50 to-accent/30 transition-all duration-300 flex items-start gap-4 group border border-border/50 hover:border-primary/30 hover:shadow-lg active:scale-[0.99] animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex-shrink-0 relative">
                    <div className={cn(
                      "p-3 rounded-xl transition-all duration-300 group-hover:scale-110",
                      getCategoryColor(result.type)
                    )}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className={cn(
                      "absolute -inset-1 rounded-xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500",
                      getCategoryAccent(result.type)
                    )} />
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-3">
                      <p className="font-semibold text-foreground text-base group-hover:text-primary transition-colors line-clamp-1">
                        {result.title}
                      </p>
                      {result.badge && (
                        <Badge variant="secondary" className="text-xs font-medium">
                          {result.badge}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-xs gap-1.5">
                        <Icon className="h-3 w-3" />
                        {getCategoryLabel(result.type)}
                      </Badge>
                      {result.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1 flex-1">
                          {result.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1 hover:scale-110">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-primary to-primary/70 text-primary-foreground">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    if (searchQuery) {
      return (
        <div key={`no-results-${contentKey}`} className="py-8 text-center animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted/50 mb-6 mx-auto relative">
            <Search className="h-8 w-8 text-muted-foreground/60" />
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-muted-foreground/20 animate-spin" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            No results found
          </h3>
          <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto">
            No matches for "<span className="font-semibold text-foreground">{searchQuery}</span>"
            {activeCategory !== 'all' && ` in ${getCategoryLabel(activeCategory as any)}`}
          </p>
          
          <div className="space-y-6 max-w-md mx-auto">
            <div>
              <h4 className="text-sm font-medium text-foreground mb-3">Try searching for:</h4>
              <div className="flex flex-wrap justify-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleRecentSearch('resident', 'resident')}
                  className="gap-1.5 transition-transform hover:scale-105"
                >
                  <User className="h-3.5 w-3.5" />
                  Resident names
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleRecentSearch('household', 'household')}
                  className="gap-1.5 transition-transform hover:scale-105"
                >
                  <Home className="h-3.5 w-3.5" />
                  Household numbers
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleRecentSearch('clearance', 'clearance')}
                  className="gap-1.5 transition-transform hover:scale-105"
                >
                  <FileText className="h-3.5 w-3.5" />
                  Clearances
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div key={`empty-${contentKey}`} className="space-y-8 animate-fade-in">
        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <History className="h-4 w-4" />
              Recent Searches
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {recentSearches.map((search, index) => {
                const category = SEARCH_CATEGORIES.find(cat => cat.type === search.type);
                const Icon = category?.icon || Search;
                return (
                  <button
                    key={index}
                    onClick={() => handleRecentSearch(search.query, search.type)}
                    className="flex items-center gap-3 p-3 rounded-xl border border-border/50 hover:border-border/80 hover:bg-accent/50 transition-all duration-200 group hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <div className={cn("p-2 rounded-lg transition-transform group-hover:scale-110", category?.color)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-foreground">{search.query}</p>
                      <p className="text-xs text-muted-foreground">
                        {category?.label || 'Search'}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {QUICK_ACTIONS.map((action, index) => {
              const Icon = action.icon;
              return (
                <div key={index} className="transition-transform hover:-translate-y-1 active:translate-y-0">
                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center gap-3 rounded-xl border-2 hover:border-primary/30 transition-all duration-300 hover:shadow-lg w-full"
                    onClick={() => handleQuickAction(action.path)}
                  >
                    <div className={cn("p-3 rounded-full text-white", action.color)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-medium text-foreground">{action.label}</span>
                  </Button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Search Tips */}
        <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-muted/20 to-muted/10 p-5 backdrop-blur-sm">
          <h3 className="text-sm font-semibold text-foreground mb-4">Search Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start gap-2.5">
                <div className="h-2 w-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">Use specific names, IDs, or reference numbers</p>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="h-2 w-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">Filter by category for precise results</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-2.5">
                <div className="h-2 w-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">Search clearance status or dates</p>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="h-2 w-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">Use date ranges for events and records</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] p-0 overflow-hidden shadow-2xl animate-in fade-in-0 zoom-in-95 duration-300">
        <div className="flex flex-col h-full bg-gradient-to-b from-background to-background/95">
          {/* Header */}
          <DialogHeader className="px-6 pt-6 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Search className="h-5 w-5 text-primary" />
                </div>
                <DialogTitle className="text-2xl font-bold text-foreground bg-clip-text bg-gradient-to-r from-primary to-primary/60">
                  Barangay Search
                </DialogTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="h-9 w-9 rounded-lg hover:bg-accent transition-all duration-200 hover:scale-110 active:scale-95"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2 ml-12">
              Search across all barangay records and management systems
            </p>
          </DialogHeader>

          {/* Search Input */}
          <div className="px-6 pb-4">
            <form onSubmit={handleSubmit} className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              </div>
              <Input
                ref={searchInputRef}
                placeholder="Search residents, households, clearances, blotters, ordinances..."
                className="pl-12 pr-12 h-14 text-base border-2 border-input/50 focus:border-primary shadow-lg rounded-xl bg-background/50 backdrop-blur-sm transition-all duration-300"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-muted-foreground hover:text-foreground transition-colors hover:scale-110 active:scale-95"
                  aria-label="Clear search"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:block">
                <kbd className="px-2 py-1 text-xs font-medium bg-muted rounded-md border border-border shadow-sm">
                  ⌘K
                </kbd>
              </div>
            </form>

            {/* Search Categories */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5" />
                  Search Categories
                </h3>
                <button
                  onClick={() => handleCategoryClick('all')}
                  className={cn(
                    "text-xs px-3 py-1.5 rounded-full transition-all duration-200 font-medium hover:scale-105 active:scale-95",
                    activeCategory === 'all' 
                      ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-md" 
                      : "bg-muted text-muted-foreground hover:bg-muted/80 hover:shadow-sm"
                  )}
                >
                  View All
                </button>
              </div>
              <ScrollArea className="w-full">
                <div className="flex space-x-3 pb-2">
                  {SEARCH_CATEGORIES.map((category) => {
                    const Icon = category.icon;
                    const isActive = activeCategory === category.type;
                    return (
                      <button
                        key={category.type}
                        onClick={() => handleCategoryClick(category.type)}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-xl border flex-shrink-0 transition-all duration-300 group hover:scale-105 active:scale-95",
                          isActive
                            ? "border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 shadow-md"
                            : "border-border/50 hover:border-border/80 hover:bg-accent/50 hover:shadow-sm"
                        )}
                      >
                        <div className={cn(
                          "p-2.5 rounded-lg transition-all duration-300 group-hover:scale-110",
                          category.color,
                          isActive && "scale-110"
                        )}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className={cn(
                          "text-sm font-medium transition-colors",
                          isActive ? "text-primary font-semibold" : "text-foreground"
                        )}>
                          {category.label}
                        </span>
                        {isActive && (
                          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-hidden border-t border-border/50">
            <ScrollArea className="h-full">
              <div className="p-6">
                {renderContent()}
              </div>
            </ScrollArea>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border/50 bg-gradient-to-t from-background to-background/80">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <kbd className="px-2 py-1 bg-muted rounded-md border border-border shadow-sm">⌘K</kbd>
                  <span>to toggle</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <kbd className="px-2 py-1 bg-muted rounded-md border border-border shadow-sm">Esc</kbd>
                  <span>to close</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="font-medium">Barangay Management System</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}