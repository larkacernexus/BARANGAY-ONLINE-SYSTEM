// pages/resident/Search/Index.tsx (Fixed)

import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import ResidentAppLayout from '@/layouts/resident-app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  User, 
  Home, 
  Briefcase,
  FileText, 
  FileCheck, 
  FileSignature,
  UserCircle,
  MapPin,
  BadgeCheck,
  Megaphone,
  Receipt,
  File,
  Calendar,
  Phone,
  Mail,
  Hash,
  AlertCircle,
  Clock,
  Filter,
  X,
  Users,
  Building,
  HelpCircle,
  Info,
  Shield
} from 'lucide-react';
import { route } from 'ziggy-js';

interface SearchResult {
  status?: string;
  id: number | string;
  type: string;
  title: string;
  subtitle: string;
  description: string;
  url: string;
  icon: string;
  badge: string;
  tags?: string[];
  meta?: Record<string, any>;
  relevance?: number;
}

interface PageProps {
  searchResults?: SearchResult[];
  recentSearches?: string[];
  currentQuery?: string;
  // Add index signature to satisfy Inertia's PageProps requirement
  [key: string]: any;
}

// Icon mapping - Resident focused
const iconMap: Record<string, React.ElementType> = {
  User,
  Home,
  Briefcase,
  FileText,
  FileCheck,
  FileSignature,
  UserCircle,
  MapPin,
  BadgeCheck,
  Megaphone,
  Receipt,
  File,
  Search,
  Users,
  Building,
  HelpCircle,
  Info,
  Shield,
  Calendar,
  Phone,
  Mail,
  Hash,
  Clock
};

// Type colors for badges
const typeColors: Record<string, string> = {
  resident: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  household: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  household_member: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
  business: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  official: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  purok: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
  clearance: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
  form: 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300',
  announcement: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
  payment: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  document: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  report: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

export default function ResidentSearchIndex() {
  const { props } = usePage<PageProps>();
  const { searchResults = [], recentSearches = [], currentQuery = '' } = props;
  
  const [searchQuery, setSearchQuery] = useState(currentQuery);
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.get(route('resident.search'), { q: searchQuery }, { preserveState: true, preserveScroll: true });
    }
  };

  const handleRecentSearchClick = (query: string) => {
    setSearchQuery(query);
    router.get(route('resident.search'), { q: query }, { preserveState: true, preserveScroll: true });
  };

  const clearSearch = () => {
    setSearchQuery('');
    router.get(route('resident.search'), {}, { preserveState: true, preserveScroll: true });
  };

  const handleResultClick = (url: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (url && url !== '#') {
      router.visit(url);
    }
  };

  const getIcon = (iconName: string) => {
    const Icon = iconMap[iconName] || Search;
    return <Icon className="h-5 w-5" />;
  };

  const getTypeColor = (type: string) => {
    return typeColors[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300';
  };

  const getStatusColor = (status?: string) => {
    if (!status) return 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300';
    
    const statusLower = status.toLowerCase();
    if (statusLower.includes('approved') || statusLower.includes('completed') || statusLower.includes('active')) {
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    }
    if (statusLower.includes('pending') || statusLower.includes('processing')) {
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    }
    if (statusLower.includes('rejected') || statusLower.includes('cancelled') || statusLower.includes('inactive')) {
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    }
    if (statusLower.includes('resolved')) {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    }
    return 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300';
  };

  // Group results by type for tabs
  const groupedResults = (searchResults || []).reduce((acc, result) => {
    if (result && result.type) {
      if (!acc[result.type]) {
        acc[result.type] = [];
      }
      acc[result.type].push(result);
    }
    return acc;
  }, {} as Record<string, SearchResult[]>);

  // Get unique tags for filtering
  const allTags = Array.from(new Set(
    (searchResults || [])
      .flatMap(r => r.tags || [])
      .filter(Boolean)
  ));

  // Resident-focused result types
  const resultTypes = [
    { value: 'all', label: 'All Results', count: searchResults?.length || 0, icon: Search },
    { value: 'resident', label: 'Residents', count: groupedResults.resident?.length || 0, icon: User },
    { value: 'household_member', label: 'Household Members', count: groupedResults.household_member?.length || 0, icon: Users },
    { value: 'household', label: 'Households', count: groupedResults.household?.length || 0, icon: Home },
    { value: 'business', label: 'Businesses', count: groupedResults.business?.length || 0, icon: Briefcase },
    { value: 'clearance', label: 'Clearances', count: groupedResults.clearance?.length || 0, icon: FileCheck },
    { value: 'document', label: 'Documents', count: groupedResults.document?.length || 0, icon: File },
    { value: 'payment', label: 'Payments', count: groupedResults.payment?.length || 0, icon: Receipt },
    { value: 'announcement', label: 'Announcements', count: groupedResults.announcement?.length || 0, icon: Megaphone },
    { value: 'official', label: 'Officials', count: groupedResults.official?.length || 0, icon: BadgeCheck },
    { value: 'purok', label: 'Puroks', count: groupedResults.purok?.length || 0, icon: MapPin },
  ].filter(type => type.count > 0 || type.value === 'all');

  const filteredResults = activeTab === 'all' 
    ? (searchResults || []).filter(r => filters.length === 0 || (r.tags && r.tags.some(tag => filters.includes(tag))))
    : (searchResults || []).filter(r => r.type === activeTab && (filters.length === 0 || (r.tags && r.tags.some(tag => filters.includes(tag)))));

  const toggleFilter = (tag: string) => {
    setFilters(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <>
      <Head title={currentQuery ? `Search: ${currentQuery}` : 'Search'} />
      
      <div className="flex flex-col gap-6 p-4 md:p-6">
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Search</h1>
          <p className="text-muted-foreground">
            Search for residents, household members, businesses, clearances, and more
          </p>
        </div>

        <Card className="border-border">
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for residents, households, clearances..."
                  className="pl-10 pr-10 py-2 w-full"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <Button type="submit" disabled={!searchQuery.trim()}>
                Search
              </Button>
            </form>
          </CardContent>
        </Card>

        {!currentQuery && recentSearches.length > 0 && (
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                <Clock className="h-5 w-5 text-muted-foreground" />
                Recent Searches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((query, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleRecentSearchClick(query)}
                    className="flex items-center gap-2"
                  >
                    <Search className="h-3 w-3" />
                    {query}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {!currentQuery && (
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg text-foreground">Popular Searches</CardTitle>
              <CardDescription>
                Try searching for these common items
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {['Residents', 'Households', 'Clearances', 'Payments', 'Announcements', 'Officials', 'Puroks'].map(item => (
                  <Button
                    key={item}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchQuery(item);
                      router.get(route('resident.search'), { q: item });
                    }}
                  >
                    {item}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {currentQuery && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-foreground">
                  Search results for "{currentQuery}"
                </h2>
                <Badge variant="outline" className="px-3 py-1 border-border">
                  {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'}
                </Badge>
              </div>
              
              {allTags.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Filters {filters.length > 0 && `(${filters.length})`}
                </Button>
              )}
            </div>

            {showFilters && allTags.length > 0 && (
              <Card className="border-border">
                <CardContent className="pt-4">
                  <div className="flex flex-wrap gap-2">
                    {allTags.map(tag => (
                      <Button
                        key={tag}
                        variant={filters.includes(tag) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleFilter(tag)}
                        className="text-xs"
                      >
                        {tag}
                        {filters.includes(tag) && (
                          <X className="ml-1 h-3 w-3" />
                        )}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {searchResults.length > 0 ? (
              <>
                <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="w-full justify-start overflow-x-auto flex-nowrap pb-1 bg-muted/50 dark:bg-muted/20">
                    {resultTypes.map(type => {
                      const Icon = type.icon;
                      return (
                        <TabsTrigger key={type.value} value={type.value} className="flex gap-2 flex-shrink-0">
                          <Icon className="h-4 w-4" />
                          <span>{type.label}</span>
                          <Badge variant="secondary" className="ml-1">
                            {type.count}
                          </Badge>
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>

                  <TabsContent value={activeTab} className="mt-6">
                    <div className="grid gap-4">
                      {filteredResults.map((result, index) => (
                        <div
                          key={`${result.type}-${result.id}-${index}`}
                          onClick={(e) => handleResultClick(result.url, e)}
                          className="block group cursor-pointer"
                        >
                          <Card className="hover:shadow-md transition-all duration-200 cursor-pointer hover:border-primary/50 border-border">
                            <CardContent className="p-6">
                              <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                  {getIcon(result.icon)}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="text-base font-semibold truncate text-foreground">
                                      {result.title}
                                    </h3>
                                    <Badge className={`text-xs ${getTypeColor(result.type)}`}>
                                      {result.badge}
                                    </Badge>
                                    {result.status && (
                                      <Badge className={`text-xs ${getStatusColor(result.status)}`}>
                                        {result.status}
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {result.subtitle}
                                  </p>
                                  
                                  <p className="text-sm text-muted-foreground/70 mt-1 line-clamp-2">
                                    {result.description}
                                  </p>

                                  {result.tags && result.tags.filter(Boolean).length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {result.tags.filter(Boolean).map((tag, i) => (
                                        <Badge key={i} variant="outline" className="text-xs bg-muted/50 dark:bg-muted/20 border-border">
                                          {tag}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}

                                  {result.meta && Object.keys(result.meta).length > 0 && (
                                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                                      {Object.entries(result.meta).map(([key, value]) => (
                                        value && (
                                          <span key={key} className="flex items-center gap-1">
                                            <span className="capitalize">{key.replace('_', ' ')}:</span>
                                            <span className="font-medium text-foreground">{value}</span>
                                          </span>
                                        )
                                      ))}
                                    </div>
                                  )}
                                </div>

                                <div className="flex-shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                  →
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </>
            ) : (
              <Card className="border-border">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="w-20 h-20 rounded-full bg-muted dark:bg-muted/20 flex items-center justify-center mb-6">
                    <AlertCircle className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground">No results found</h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    We couldn't find any matches for "{currentQuery}". Try adjusting your search 
                    terms or browse through the available categories.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </>
  );
}

// Layout configuration
ResidentSearchIndex.layout = (page: React.ReactNode) => (
  <ResidentAppLayout 
    breadcrumbs={[
      { title: 'Dashboard', href: route('portal.dashboard') },
      { title: 'Search', href: route('portal.search') }
    ]}
  >
    {page}
  </ResidentAppLayout>
);