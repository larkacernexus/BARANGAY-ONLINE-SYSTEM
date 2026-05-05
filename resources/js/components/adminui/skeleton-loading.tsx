// components/ui/skeleton-loading.tsx
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

// ----------------------------------------------------------------
// PRIMITIVE
// ----------------------------------------------------------------

function SkeletonBlock({ className, delay = 0 }: { className?: string; delay?: number }) {
    const [shouldAnimate, setShouldAnimate] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setShouldAnimate(true), delay);
        return () => clearTimeout(timer);
    }, [delay]);

    return (
        <Skeleton
            className={cn(
                'transition-all duration-700 ease-in-out',
                shouldAnimate ? 'animate-pulse opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95',
                className
            )}
        />
    );
}

// ----------------------------------------------------------------
// STATS CARDS - Matches your StatCard component (MAX 4)
// ----------------------------------------------------------------

function SkeletonStatCard({ index = 0 }: { index?: number }) {
    return (
        <div className="bg-white dark:bg-gray-900 rounded-lg border p-3 animate-pulse">
            <div className="flex items-center justify-between gap-2 mb-1">
                <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
            <div className="mt-1.5 h-6 bg-gray-200 dark:bg-gray-700 rounded w-12" />
            <div className="mt-0.5 h-3 bg-gray-200 dark:bg-gray-700 rounded w-24" />
        </div>
    );
}

function SkeletonStatCards({ count = 4 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {Array.from({ length: count }).map((_, i) => (
                <div 
                    key={i} 
                    className="animate-in fade-in slide-in-from-bottom-6 duration-700 ease-out"
                    style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}
                >
                    <SkeletonStatCard index={i} />
                </div>
            ))}
        </div>
    );
}

// ----------------------------------------------------------------
// HEADER - Matches AnnouncementsHeader
// ----------------------------------------------------------------

function SkeletonHeader({ isMobile = false }: { isMobile?: boolean }) {
    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-6 duration-700 ease-out">
            <div className="flex items-center gap-3">
                <SkeletonBlock className="h-7 w-48" delay={0} />
                {!isMobile && (
                    <SkeletonBlock className="h-6 w-20 rounded-full" delay={50} />
                )}
            </div>
            <div className="flex items-center gap-3">
                <SkeletonBlock className="h-9 w-24" delay={100} />
                <SkeletonBlock className="h-9 w-28" delay={150} />
            </div>
        </div>
    );
}

// ----------------------------------------------------------------
// FILTERS - Matches AnnouncementsFilters EXACTLY
// ----------------------------------------------------------------

function SkeletonFilters({ 
    isMobile = false, 
    showAdvanced = false 
}: { 
    isMobile?: boolean; 
    showAdvanced?: boolean 
}) {
    return (
        <Card className="overflow-hidden border-0 shadow-lg bg-white dark:bg-gray-900 rounded-xl animate-in fade-in slide-in-from-bottom-6 duration-700 ease-out delay-300">
            <CardContent className="p-5 md:p-6">
                <div className="flex flex-col space-y-5">
                    {/* Search Bar */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <SkeletonBlock className="h-4 w-4 rounded" delay={200} />
                            </div>
                            <SkeletonBlock className="h-10 w-full rounded-xl" delay={200} />
                            <div className="absolute right-1 top-1/2 transform -translate-y-1/2">
                                <SkeletonBlock className="h-7 w-7 rounded-full" delay={250} />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <SkeletonBlock className="h-10 w-28 rounded-xl" delay={300} />
                            <SkeletonBlock className="h-10 w-24 rounded-xl" delay={350} />
                        </div>
                    </div>

                    {/* Results Info & Active Filters Bar */}
                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                        <SkeletonBlock className="h-8 w-48 rounded-lg" delay={400} />
                        
                        <div className="flex items-center gap-2 flex-wrap">
                            {showAdvanced && (
                                <>
                                    <SkeletonBlock className="h-6 w-20 rounded-full" delay={450} />
                                    <SkeletonBlock className="h-6 w-24 rounded-full" delay={500} />
                                    <SkeletonBlock className="h-6 w-28 rounded-full" delay={550} />
                                    <SkeletonBlock className="h-6 w-24 rounded-full" delay={600} />
                                </>
                            )}
                            <SkeletonBlock className="h-7 w-20 rounded-lg" delay={650} />
                        </div>
                    </div>

                    {/* Basic Filters - Grid of 4 selects */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="space-y-1.5">
                                <SkeletonBlock className="h-3 w-16" delay={400 + i * 50} />
                                <SkeletonBlock className="h-9 w-full rounded-lg" delay={450 + i * 50} />
                            </div>
                        ))}
                    </div>

                    {/* Advanced Filters */}
                    {showAdvanced && (
                        <div className="border-t border-gray-100 dark:border-gray-800 pt-5 mt-2 space-y-5">
                            <div className="flex items-center gap-2">
                                <SkeletonBlock className="h-5 w-1 rounded-full" delay={600} />
                                <SkeletonBlock className="h-4 w-48" delay={650} />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Date Range Section */}
                                <div className="space-y-3 bg-gray-50/40 dark:bg-gray-800/20 p-3 rounded-xl">
                                    <SkeletonBlock className="h-4 w-32" delay={700} />
                                    <SkeletonBlock className="h-9 w-full rounded-lg" delay={750} />
                                    <div className="grid grid-cols-2 gap-2 pt-1">
                                        <SkeletonBlock className="h-9 w-full rounded-lg" delay={800} />
                                        <SkeletonBlock className="h-9 w-full rounded-lg" delay={850} />
                                    </div>
                                </div>

                                {/* Quick Actions Section */}
                                <div className="space-y-3 bg-gray-50/40 dark:bg-gray-800/20 p-3 rounded-xl">
                                    <SkeletonBlock className="h-4 w-32" delay={700} />
                                    <div className="flex flex-wrap gap-2">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <SkeletonBlock key={i} className="h-8 w-20 rounded-lg" delay={750 + i * 50} />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Information Section */}
                            <div className="mt-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-800/30 dark:to-gray-800/10 rounded-xl border border-gray-100 dark:border-gray-800">
                                <SkeletonBlock className="h-3 w-48 mb-2" delay={900} />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <SkeletonBlock key={i} className="h-3 w-full" delay={950 + i * 50} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

// ----------------------------------------------------------------
// CONTENT CARD - Matches AnnouncementsContent EXACTLY
// ----------------------------------------------------------------

function SkeletonContentCard({
    type = 'table',
    rows = 10,
    hasCheckbox = true,
    isMobile = false,
    isBulkMode = false,
}: {
    type?: 'table' | 'grid';
    rows?: number;
    hasCheckbox?: boolean;
    isMobile?: boolean;
    isBulkMode?: boolean;
}) {
    return (
        <Card className="overflow-hidden border border-gray-200 dark:border-gray-700 dark:bg-gray-900 animate-in fade-in zoom-in-98 duration-700 ease-out delay-400">
            {/* Card Header */}
            <CardHeader className="flex flex-row items-center justify-between pb-3 p-4 sm:p-6 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <SkeletonBlock className="h-5 w-5 rounded" delay={300} />
                        <div className="flex items-center gap-3">
                            <SkeletonBlock className="h-5 w-48" delay={300} />
                            {isBulkMode && (
                                <SkeletonBlock className="h-5 w-20 rounded-full" delay={350} />
                            )}
                        </div>
                    </div>
                    {/* View Toggle */}
                    <div className="flex items-center gap-1">
                        <SkeletonBlock className="h-8 w-8 rounded" delay={350} />
                        <SkeletonBlock className="h-8 w-8 rounded" delay={400} />
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    {/* Per Page Selector */}
                    {!isMobile && (
                        <div className="flex items-center gap-2">
                            <SkeletonBlock className="h-4 w-4 rounded" delay={400} />
                            <SkeletonBlock className="h-8 w-[140px] rounded" delay={450} />
                        </div>
                    )}
                    
                    {/* Sort Selector */}
                    {!isMobile && (
                        <div className="flex items-center gap-2">
                            <SkeletonBlock className="h-4 w-4 rounded" delay={500} />
                            <SkeletonBlock className="h-8 w-[180px] rounded" delay={550} />
                        </div>
                    )}
                    
                    {/* Grid Select All */}
                    {type === 'grid' && isBulkMode && (
                        <div className="flex items-center gap-2">
                            <SkeletonBlock className="h-4 w-4 rounded" delay={600} />
                            <SkeletonBlock className="h-4 w-24" delay={650} />
                        </div>
                    )}
                    
                    {/* Bulk Mode Switch */}
                    {!isMobile && (
                        <div className="flex items-center gap-2">
                            <SkeletonBlock className="h-5 w-9 rounded" delay={700} />
                            <SkeletonBlock className="h-4 w-20" delay={750} />
                        </div>
                    )}
                    
                    {/* Results Count */}
                    <SkeletonBlock className="h-4 w-32" delay={800} />
                </div>
            </CardHeader>
            
            {/* Card Content */}
            <CardContent className="p-0 dark:bg-gray-900">
                {type === 'table' ? (
                    <SkeletonTable 
                        rows={rows} 
                        hasCheckbox={hasCheckbox}
                        isMobile={isMobile}
                    />
                ) : (
                    <div className="p-4">
                        <SkeletonGridView rows={rows} />
                    </div>
                )}
                
                {/* Pagination Footer */}
                <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                        {/* Mobile Per Page */}
                        {isMobile && (
                            <div className="flex items-center gap-2 w-full">
                                <SkeletonBlock className="h-4 w-4 rounded" delay={850} />
                                <SkeletonBlock className="h-8 w-full rounded" delay={900} />
                            </div>
                        )}
                        
                        {/* Pagination */}
                        <div className="w-full flex items-center justify-between">
                            <SkeletonBlock className="h-4 w-48" delay={950} />
                            <div className="flex items-center gap-2">
                                <SkeletonBlock className="h-8 w-8 rounded" delay={1000} />
                                <SkeletonBlock className="h-8 w-8 rounded" delay={1050} />
                                <SkeletonBlock className="h-8 w-8 rounded" delay={1100} />
                                <SkeletonBlock className="h-8 w-8 rounded" delay={1150} />
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// ----------------------------------------------------------------
// TABLE - Matches AnnouncementsTableView EXACTLY
// ----------------------------------------------------------------

function SkeletonTableRow({ 
    cols, 
    hasCheckbox = false, 
    rowIndex = 0,
    isMobile = false 
}: { 
    cols: number; 
    hasCheckbox?: boolean; 
    rowIndex?: number;
    isMobile?: boolean;
}) {
    // Mobile: Title, Type, Priority, Status, Actions (4 cols + checkbox)
    // Desktop: Title, Type, Priority, Date Range, Status, Actions (5 cols + checkbox)
    const colCount = isMobile ? 4 : 5;
    
    return (
        <TableRow className="transition-all duration-500 animate-in fade-in slide-in-from-left-4 ease-out hover:bg-gray-50/50 dark:hover:bg-gray-900/30">
            {hasCheckbox && (
                <TableCell className="px-3 py-2 sm:px-4 sm:py-3 w-10 sm:w-12 text-center">
                    <SkeletonBlock className="h-4 w-4 rounded mx-auto" delay={rowIndex * 30} />
                </TableCell>
            )}
            
            {/* Title & Details Column */}
            <TableCell className="px-3 py-2 sm:px-4 sm:py-3 min-w-[150px] sm:min-w-[200px]">
                <div className="flex items-center gap-2 sm:gap-3">
                    <SkeletonBlock className="h-8 w-8 rounded-full" delay={rowIndex * 30 + 10} />
                    <div className="min-w-0 space-y-1">
                        <SkeletonBlock className="h-4 w-3/4" delay={rowIndex * 30 + 20} />
                        <SkeletonBlock className="h-3 w-2/3" delay={rowIndex * 30 + 30} />
                        <SkeletonBlock className="h-3 w-1/2" delay={rowIndex * 30 + 40} />
                    </div>
                </div>
            </TableCell>
            
            {/* Type Column */}
            <TableCell className="px-3 py-2 sm:px-4 sm:py-3 min-w-[100px] sm:min-w-[120px]">
                <SkeletonBlock className="h-5 w-16 rounded-full" delay={rowIndex * 30 + 50} />
            </TableCell>
            
            {/* Priority Column */}
            <TableCell className="px-3 py-2 sm:px-4 sm:py-3 min-w-[100px] sm:min-w-[120px]">
                <SkeletonBlock className="h-5 w-16 rounded-full" delay={rowIndex * 30 + 60} />
            </TableCell>
            
            {/* Date Range Column - Desktop only */}
            {!isMobile && (
                <TableCell className="px-4 py-3 min-w-[150px]">
                    <div className="space-y-1">
                        <SkeletonBlock className="h-3 w-3/4" delay={rowIndex * 30 + 70} />
                        <SkeletonBlock className="h-3 w-3/4" delay={rowIndex * 30 + 80} />
                        <SkeletonBlock className="h-3 w-1/2" delay={rowIndex * 30 + 90} />
                    </div>
                </TableCell>
            )}
            
            {/* Status Column */}
            <TableCell className="px-3 py-2 sm:px-4 sm:py-3 min-w-[100px] sm:min-w-[120px]">
                <SkeletonBlock className="h-5 w-16 rounded-full" delay={rowIndex * 30 + (isMobile ? 70 : 100)} />
            </TableCell>
            
            {/* Actions Column - Sticky right */}
            <TableCell className="px-3 py-2 sm:px-4 sm:py-3 text-right sticky right-0 bg-white dark:bg-gray-900 min-w-[60px] sm:min-w-[80px]">
                <SkeletonBlock className="h-8 w-8 rounded ml-auto" delay={rowIndex * 30 + (isMobile ? 80 : 110)} />
            </TableCell>
        </TableRow>
    );
}

function SkeletonTable({
    rows = 10,
    hasCheckbox = true,
    hasHeader = true,
    isMobile = false,
}: {
    rows?: number;
    hasCheckbox?: boolean;
    hasHeader?: boolean;
    isMobile?: boolean;
}) {
    return (
        <div className="overflow-x-auto">
            <div className="min-w-full inline-block align-middle">
                <div className="overflow-hidden">
                    <Table className="min-w-full">
                        {hasHeader && (
                            <TableHeader>
                                <TableRow className="bg-gray-50 dark:bg-gray-900 transition-all duration-500 animate-in fade-in slide-in-from-top-4 ease-out">
                                    {hasCheckbox && (
                                        <TableHead className="px-3 py-2 sm:px-4 sm:py-3 text-center w-10 sm:w-12">
                                            <SkeletonBlock className="h-4 w-4 rounded mx-auto" delay={0} />
                                        </TableHead>
                                    )}
                                    
                                    <TableHead className="px-3 py-2 sm:px-4 sm:py-3 min-w-[150px] sm:min-w-[200px]">
                                        <SkeletonBlock className="h-3 w-16" delay={30} />
                                    </TableHead>
                                    
                                    <TableHead className="px-3 py-2 sm:px-4 sm:py-3 min-w-[100px] sm:min-w-[120px]">
                                        <SkeletonBlock className="h-3 w-16" delay={60} />
                                    </TableHead>
                                    
                                    <TableHead className="px-3 py-2 sm:px-4 sm:py-3 min-w-[100px] sm:min-w-[120px]">
                                        <SkeletonBlock className="h-3 w-16" delay={90} />
                                    </TableHead>
                                    
                                    {!isMobile && (
                                        <TableHead className="px-4 py-3 min-w-[150px]">
                                            <SkeletonBlock className="h-3 w-16" delay={120} />
                                        </TableHead>
                                    )}
                                    
                                    <TableHead className="px-3 py-2 sm:px-4 sm:py-3 min-w-[100px] sm:min-w-[120px]">
                                        <SkeletonBlock className="h-3 w-16" delay={isMobile ? 120 : 150} />
                                    </TableHead>
                                    
                                    <TableHead className="px-3 py-2 sm:px-4 sm:py-3 text-right sticky right-0 bg-gray-50 dark:bg-gray-900 min-w-[60px] sm:min-w-[80px]">
                                        <SkeletonBlock className="h-3 w-16 ml-auto" delay={isMobile ? 150 : 180} />
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                        )}
                        <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {Array.from({ length: rows }).map((_, i) => (
                                <SkeletonTableRow 
                                    key={i} 
                                    cols={isMobile ? 4 : 5} 
                                    hasCheckbox={hasCheckbox} 
                                    rowIndex={i}
                                    isMobile={isMobile}
                                />
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}

// ----------------------------------------------------------------
// GRID VIEW - For mobile
// ----------------------------------------------------------------

function SkeletonGridCard({ index = 0 }: { index?: number }) {
    return (
        <Card className="h-full animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <SkeletonBlock className="h-5 w-3/4" delay={index * 50} />
                    <SkeletonBlock className="h-5 w-5 rounded-full" delay={index * 50 + 25} />
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <SkeletonBlock className="h-4 w-full" delay={index * 50 + 50} />
                <SkeletonBlock className="h-4 w-2/3" delay={index * 50 + 75} />
                <div className="flex items-center gap-2 pt-2">
                    <SkeletonBlock className="h-5 w-16 rounded-full" delay={index * 50 + 100} />
                    <SkeletonBlock className="h-5 w-20 rounded-full" delay={index * 50 + 125} />
                </div>
            </CardContent>
        </Card>
    );
}

function SkeletonGridView({ rows = 8 }: { rows?: number }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: rows }).map((_, i) => (
                <SkeletonGridCard key={i} index={i} />
            ))}
        </div>
    );
}

// ----------------------------------------------------------------
// PAGE SKELETON - Complete page layout matching AnnouncementsIndex
// ----------------------------------------------------------------

interface PageSkeletonProps {
    type?: 'table' | 'grid';
    hasStats?: boolean;
    hasFilters?: boolean;
    rows?: number;
    hasCheckbox?: boolean;
    showAdvancedFilters?: boolean;
    isMobile?: boolean;
    isBulkMode?: boolean;
}

export function PageSkeleton({
    type = 'table',
    hasStats = true,
    hasFilters = true,
    rows = 10,
    hasCheckbox = true,
    showAdvancedFilters = false,
    isMobile = false,
    isBulkMode = false,
}: PageSkeletonProps) {
    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <SkeletonHeader isMobile={isMobile} />

            {/* Stats - MAX 4 cards */}
            {hasStats && <SkeletonStatCards count={4} />}

            {/* Filters */}
            {hasFilters && (
                <SkeletonFilters 
                    isMobile={isMobile} 
                    showAdvanced={showAdvancedFilters} 
                />
            )}

            {/* Bulk Mode Banner - only if in bulk mode */}
            {isBulkMode && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out delay-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <SkeletonBlock className="h-4 w-4 rounded" delay={250} />
                            <SkeletonBlock className="h-4 w-32" delay={300} />
                        </div>
                        <SkeletonBlock className="h-8 w-24 rounded" delay={350} />
                    </div>
                </div>
            )}

            {/* Content Card */}
            <SkeletonContentCard
                type={type}
                rows={rows}
                hasCheckbox={hasCheckbox}
                isMobile={isMobile}
                isBulkMode={isBulkMode}
            />

            {/* Bulk mode shortcuts - only if in bulk mode */}
            {isBulkMode && !isMobile && (
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out delay-900">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <SkeletonBlock className="h-4 w-4 rounded" delay={900} />
                            <SkeletonBlock className="h-4 w-32" delay={950} />
                        </div>
                        <SkeletonBlock className="h-7 w-24" delay={1000} />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <SkeletonBlock key={i} className="h-6 w-24" delay={1000 + i * 50} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}