// components/portal/records/DocumentTypeSelector.tsx

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Search, 
  List, 
  Grid, 
  SortAsc, 
  SortDesc, 
  Check, 
  Database, 
  ShieldCheck, 
  CalendarDays, 
  Tag, 
  FileWarning,
  FileText,
  Image,
  File,
  FileSpreadsheet,
  FileImage,
  FileArchive,
  Video,
  Music,
  Code,
  BookOpen,
  Briefcase,
  GraduationCap,
  Heart,
  Home,
  DollarSign,
  Award,
  User,
  Users,
  Settings,
  Mail,
  Phone,
  MapPin,
  Clock,
  AlertCircle,
  Filter,
  ChevronDown,
  X,
  ChevronRight
} from 'lucide-react';
import { DocumentType, DocumentCategory } from '@/types/portal/records/records';
import { formatKBtoMB } from '@/types/portal/records/utils/records-helpers';

// Helper function to get category icon component
const getCategoryIcon = (iconName: string) => {
  const iconMap: Record<string, React.ElementType> = {
    'file-text': FileText,
    'image': Image,
    'file': File,
    'spreadsheet': FileSpreadsheet,
    'file-image': FileImage,
    'archive': FileArchive,
    'video': Video,
    'music': Music,
    'code': Code,
    'book': BookOpen,
    'briefcase': Briefcase,
    'graduation-cap': GraduationCap,
    'heart': Heart,
    'home': Home,
    'dollar-sign': DollarSign,
    'award': Award,
    'user': User,
    'users': Users,
    'settings': Settings,
    'mail': Mail,
    'phone': Phone,
    'map-pin': MapPin,
    'clock': Clock,
    'alert-circle': AlertCircle,
  };
  
  return iconMap[iconName] || FileText;
};

interface DocumentTypeSelectorProps {
  categories: DocumentCategory[];
  filteredDocumentTypes: (DocumentType & {
    category_name: string;
    category_icon: string;
    category_color: string;
    category_description?: string;
  })[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: 'name' | 'size' | 'date';
  onSortByChange: (sort: 'name' | 'size' | 'date') => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: () => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: () => void;
  selectedDocumentTypeId: string;
  onSelect: (id: string) => void;
  maxFileSize: number;
  allowedTypes: string[];
}

export function DocumentTypeSelector({
  categories,
  filteredDocumentTypes,
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  viewMode,
  onViewModeChange,
  selectedDocumentTypeId,
  onSelect,
  maxFileSize,
  allowedTypes,
}: DocumentTypeSelectorProps) {
  // State for mobile filter drawer
  const [showMobileFilters, setShowMobileFilters] = React.useState(false);

  // Get selected category name for display
  const selectedCategoryName = selectedCategory === 'all' 
    ? 'All Categories' 
    : categories.find(c => c.id.toString() === selectedCategory)?.name || 'All Categories';

  return (
    <Card className="relative w-full overflow-hidden bg-white/80 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-800/50 shadow-xl shadow-gray-200/50 dark:shadow-gray-950/50">
      {/* Background Texture Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/50 dark:from-blue-950/20 dark:via-gray-900/0 dark:to-purple-950/20 pointer-events-none" />
      
      {/* Noise Texture */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03] pointer-events-none" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
      />

      {/* Animated Gradient Orbs */}
      <div className="absolute -top-20 -right-20 w-60 h-60 bg-gradient-to-br from-blue-400/10 to-purple-400/10 dark:from-blue-400/5 dark:to-purple-400/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-gradient-to-tr from-amber-400/10 to-orange-400/10 dark:from-amber-400/5 dark:to-orange-400/5 rounded-full blur-3xl animate-pulse animation-delay-2000" />

      <CardHeader className="relative px-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <CardTitle className="bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent text-lg sm:text-xl font-bold">
              Select Document Type
            </CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Choose the type of document you want to upload
            </CardDescription>
          </div>
          
          {/* View Toggle - Hidden on mobile, shown on desktop */}
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onViewModeChange}
            className="hidden sm:flex relative overflow-hidden bg-white/50 dark:bg-gray-900/50 border-gray-200/50 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300"
            aria-label={viewMode === 'grid' ? 'Switch to list view' : 'Switch to grid view'}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-purple-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            {viewMode === 'grid' ? <List className="h-5 w-5" /> : <Grid className="h-5 w-5" />}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="relative px-4 sm:px-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
          <Input
            placeholder="Search document types..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-10 w-full bg-white/50 dark:bg-gray-900/50 border-gray-200/50 dark:border-gray-700/50 dark:text-white dark:placeholder:text-gray-500 focus:bg-white dark:focus:bg-gray-900 transition-all duration-300"
          />
          {searchQuery && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
              onClick={() => onSearchChange('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-2">
          {/* Mobile Filter Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="sm:hidden flex-1 justify-between bg-white/50 dark:bg-gray-900/50 border-gray-200/50 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-900"
          >
            <span className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </span>
            <ChevronDown className={`h-4 w-4 transition-transform ${showMobileFilters ? 'rotate-180' : ''}`} />
          </Button>

          {/* Category Filter - Desktop */}
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="hidden sm:block px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white/50 dark:bg-gray-900/50 border-gray-200/50 dark:border-gray-700/50 dark:text-gray-300 min-w-[160px] backdrop-blur-sm transition-all duration-300"
            aria-label="Select category"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          {/* Sort Controls - Desktop */}
          <div className="hidden sm:flex items-center gap-2 ml-auto">
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value as 'name' | 'size' | 'date')}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white/50 dark:bg-gray-900/50 border-gray-200/50 dark:border-gray-700/50 dark:text-gray-300 min-w-[140px] backdrop-blur-sm transition-all duration-300"
              aria-label="Sort by"
            >
              <option value="name">Sort by Name</option>
              <option value="size">Sort by Size</option>
              <option value="date">Sort by Date</option>
            </select>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={onSortOrderChange}
              className="bg-white/50 dark:bg-gray-900/50 border-gray-200/50 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-900 transition-all duration-300"
              aria-label={sortOrder === 'asc' ? 'Sort descending' : 'Sort ascending'}
            >
              {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
            </Button>
          </div>

          {/* Mobile View Toggle */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onViewModeChange}
            className="sm:hidden bg-white/50 dark:bg-gray-900/50 border-gray-200/50 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-900 px-3 transition-all duration-300"
            aria-label={viewMode === 'grid' ? 'Switch to list view' : 'Switch to grid view'}
          >
            {viewMode === 'grid' ? (
              <>
                <List className="h-4 w-4 mr-2" />
                <span className="text-xs">List</span>
              </>
            ) : (
              <>
                <Grid className="h-4 w-4 mr-2" />
                <span className="text-xs">Grid</span>
              </>
            )}
          </Button>
        </div>

        {/* Mobile Filters - Expandable */}
        {showMobileFilters && (
          <div className="sm:hidden space-y-3 p-4 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md rounded-lg border border-gray-200/50 dark:border-gray-700/50 animate-in slide-in-from-top-2 duration-300">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white/50 dark:bg-gray-900/50 border-gray-200/50 dark:border-gray-700/50 dark:text-gray-300 backdrop-blur-sm"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort By</label>
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => onSortByChange(e.target.value as 'name' | 'size' | 'date')}
                  className="flex-1 px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white/50 dark:bg-gray-900/50 border-gray-200/50 dark:border-gray-700/50 dark:text-gray-300 backdrop-blur-sm"
                >
                  <option value="name">Name</option>
                  <option value="size">Size</option>
                  <option value="date">Date</option>
                </select>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={onSortOrderChange}
                  className="bg-white/50 dark:bg-gray-900/50 border-gray-200/50 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-900 h-auto aspect-square"
                >
                  {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {(selectedCategory !== 'all' || searchQuery) && (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-gray-500 dark:text-gray-400">Active filters:</span>
            {selectedCategory !== 'all' && (
              <Badge variant="secondary" className="gap-1 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50">
                {selectedCategoryName}
                <button
                  onClick={() => onCategoryChange('all')}
                  className="ml-1 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {searchQuery && (
              <Badge variant="secondary" className="gap-1 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50">
                "{searchQuery}"
                <button
                  onClick={() => onSearchChange('')}
                  className="ml-1 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}

        {/* Document Types - Distinct Grid vs List Views */}
        {viewMode === 'grid' ? (
          /* GRID VIEW - Card style for mobile */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredDocumentTypes.map((type) => {
              const CategoryIcon = getCategoryIcon(type.category_icon);
              const isSelected = selectedDocumentTypeId === type.id.toString();
              
              const acceptedFormats = Array.isArray(type.accepted_formats) ? type.accepted_formats : [];
              const acceptedFormatsString = acceptedFormats.length > 0 
                ? acceptedFormats.map(f => f.split('/').pop()?.toUpperCase() || f.toUpperCase()).slice(0, 2).join(', ')
                : allowedTypes.map(t => t.split('/').pop()?.toUpperCase() || t.toUpperCase()).slice(0, 2).join(', ');
              
              const hasMoreFormats = (acceptedFormats.length > 2) || (allowedTypes.length > 2);
              
              const maxSizeMB = type.max_file_size 
                ? formatKBtoMB(type.max_file_size * 1024) 
                : formatKBtoMB(maxFileSize * 1024);
              
              return (
                <div
                  key={type.id}
                  className={`
                    relative overflow-hidden border rounded-lg p-3 cursor-pointer transition-all duration-300
                    ${isSelected 
                      ? 'border-blue-500/50 bg-blue-50/80 dark:bg-blue-900/20 dark:border-blue-700/50 ring-2 ring-blue-500/20 backdrop-blur-sm' 
                      : 'border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-900 hover:border-blue-300/50 dark:hover:border-blue-700/50 hover:shadow-lg hover:shadow-blue-500/5'
                    }
                  `}
                  onClick={() => onSelect(type.id.toString())}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelect(type.id.toString());
                    }
                  }}
                  aria-selected={isSelected}
                >
                  {/* Card Hover Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />
                  
                  <div className="flex flex-col gap-2 relative">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="p-2 rounded-lg backdrop-blur-sm" 
                          style={{ backgroundColor: `${type.category_color}20` }}
                        >
                          <CategoryIcon className="h-5 w-5" style={{ color: type.category_color }} />
                        </div>
                        <div>
                          <h4 className={`font-medium text-sm ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-white'}`}>
                            {type.name}
                          </h4>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400">
                            {type.code}
                          </p>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="bg-blue-500/10 rounded-full p-1">
                          <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 min-h-[2rem]">
                      {type.description || 'No description available'}
                    </p>

                    <div className="flex items-center gap-1 mt-1">
                      {type.requires_expiry_date && (
                        <Badge variant="outline" className="text-[8px] py-0 h-4 px-1 bg-white/50 dark:bg-gray-900/50 border-gray-200/50 dark:border-gray-700/50">
                          <CalendarDays className="h-2.5 w-2.5 mr-0.5 text-yellow-600" />
                          <span>Expiry</span>
                        </Badge>
                      )}
                      {type.requires_reference_number && (
                        <Badge variant="outline" className="text-[8px] py-0 h-4 px-1 bg-white/50 dark:bg-gray-900/50 border-gray-200/50 dark:border-gray-700/50">
                          <Tag className="h-2.5 w-2.5 mr-0.5 text-purple-600" />
                          <span>Ref #</span>
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1 mt-1">
                      <Badge variant="outline" className="text-[8px] py-0 h-4 bg-white/50 dark:bg-gray-900/50 border-gray-200/50 dark:border-gray-700/50">
                        <ShieldCheck className="h-2.5 w-2.5 mr-0.5 text-gray-500 dark:text-gray-400" />
                        {maxSizeMB}
                      </Badge>
                      <Badge variant="outline" className="text-[8px] py-0 h-4 bg-white/50 dark:bg-gray-900/50 border-gray-200/50 dark:border-gray-700/50">
                        <Check className="h-2.5 w-2.5 mr-0.5 text-gray-500 dark:text-gray-400" />
                        {acceptedFormatsString}
                        {hasMoreFormats && '...'}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* LIST VIEW - Row style for mobile */
          <div className="space-y-2">
            {filteredDocumentTypes.map((type) => {
              const CategoryIcon = getCategoryIcon(type.category_icon);
              const isSelected = selectedDocumentTypeId === type.id.toString();
              
              const maxSizeMB = type.max_file_size 
                ? formatKBtoMB(type.max_file_size * 1024) 
                : formatKBtoMB(maxFileSize * 1024);
              
              return (
                <div
                  key={type.id}
                  className={`
                    relative overflow-hidden border rounded-lg p-3 cursor-pointer transition-all duration-300
                    ${isSelected 
                      ? 'border-blue-500/50 bg-blue-50/80 dark:bg-blue-900/20 dark:border-blue-700/50 ring-2 ring-blue-500/20 backdrop-blur-sm' 
                      : 'border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-900 hover:border-blue-300/50 dark:hover:border-blue-700/50 hover:shadow-lg hover:shadow-blue-500/5'
                    }
                  `}
                  onClick={() => onSelect(type.id.toString())}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelect(type.id.toString());
                    }
                  }}
                  aria-selected={isSelected}
                >
                  {/* Card Hover Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />
                  
                  <div className="flex items-center gap-3 relative">
                    <div 
                      className="p-2 rounded-lg flex-shrink-0 backdrop-blur-sm" 
                      style={{ backgroundColor: `${type.category_color}20` }}
                    >
                      <CategoryIcon className="h-5 w-5" style={{ color: type.category_color }} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className={`font-medium text-sm truncate ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-white'}`}>
                          {type.name}
                        </h4>
                        {isSelected && (
                          <div className="bg-blue-500/10 rounded-full p-1">
                            <Check className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                          </div>
                        )}
                      </div>
                      
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        {type.description || 'No description'}
                      </p>
                      
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-gray-500 dark:text-gray-400">
                          {type.code}
                        </span>
                        <span className="text-[10px] text-gray-500 dark:text-gray-400">•</span>
                        <span className="text-[10px] text-gray-500 dark:text-gray-400">
                          {maxSizeMB}
                        </span>
                        {(type.requires_expiry_date || type.requires_reference_number) && (
                          <>
                            <span className="text-[10px] text-gray-500 dark:text-gray-400">•</span>
                            <div className="flex items-center gap-1">
                              {type.requires_expiry_date && (
                                <CalendarDays className="h-3 w-3 text-yellow-600 dark:text-yellow-400" />
                              )}
                              {type.requires_reference_number && (
                                <Tag className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-600 flex-shrink-0" />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Results Count */}
        {filteredDocumentTypes.length > 0 && (
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center sm:text-left">
            Showing {filteredDocumentTypes.length} document type{filteredDocumentTypes.length !== 1 ? 's' : ''}
          </div>
        )}

        {/* Empty State */}
        {filteredDocumentTypes.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <div className="relative inline-block">
              <FileWarning className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-400/10 to-transparent blur-xl" />
            </div>
            <h3 className="font-medium text-base mb-1 text-gray-900 dark:text-white">No document types found</h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-[250px] mx-auto">
              {searchQuery 
                ? `No results match "${searchQuery}"` 
                : 'Try adjusting your filters'}
            </p>
            {(searchQuery || selectedCategory !== 'all') && (
              <Button
                type="button"
                variant="link"
                size="sm"
                className="mt-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                onClick={() => {
                  onSearchChange('');
                  onCategoryChange('all');
                  setShowMobileFilters(false);
                }}
              >
                Clear all filters
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}