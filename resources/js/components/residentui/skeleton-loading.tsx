// C:/xampp/htdocs/BARANGAY-ONLINE-SYSTEM/resources/js/components/residentui/skeleton-loading.tsx

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useEffect, useMemo } from 'react';

// Types
interface SkeletonBlockProps {
    className?: string;
    delay?: number;
    animate?: boolean;
    ariaLabel?: string;
}

interface UniversalSkeletonProps {
    variant?: 'card' | 'list' | 'table' | 'grid' | 'detail' | 'form' | 'stats' | 'profile' | 'filters' | 'dashboard';
    isMobile?: boolean;
    hasStats?: boolean;
    hasFilters?: boolean;
    hasHeader?: boolean;
    hasAction?: boolean;
    hasImage?: boolean;
    count?: number;
    fields?: number;
    density?: 'compact' | 'default' | 'comfortable';
}

// Skeleton Block Component
function SkeletonBlock({ 
    className = "", 
    delay = 0,
    animate = true,
    ariaLabel = "Loading content..." 
}: SkeletonBlockProps) {
    if (!animate) {
        return (
            <div 
                role="status"
                aria-label={ariaLabel}
                aria-busy="true"
                className={cn("rounded bg-gray-200 dark:bg-gray-700", className)} 
            />
        );
    }
    
    return (
        <motion.div
            role="status"
            aria-label={ariaLabel}
            aria-busy="true"
            initial={{ opacity: 0.5 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: delay / 1000,
            }}
            className={cn("rounded bg-gray-200 dark:bg-gray-700", className)}
        />
    );
}

// Header Section Skeleton
function HeaderSectionSkeleton({ isMobile = false }: { isMobile?: boolean }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
                <SkeletonBlock className="h-8 w-48 md:w-64" delay={0} ariaLabel="Loading page title" />
                {!isMobile && (
                    <SkeletonBlock className="h-4 w-72" delay={50} ariaLabel="Loading page description" />
                )}
            </div>
            <div className="flex items-center gap-2">
                {isMobile ? (
                    <>
                        <SkeletonBlock className="h-9 w-9 rounded-lg" delay={100} ariaLabel="Loading action button" />
                        <SkeletonBlock className="h-9 w-9 rounded-lg" delay={150} ariaLabel="Loading action button" />
                    </>
                ) : (
                    <>
                        <SkeletonBlock className="h-9 w-24 rounded-lg" delay={100} ariaLabel="Loading action button" />
                        <SkeletonBlock className="h-9 w-24 rounded-lg" delay={150} ariaLabel="Loading action button" />
                        <SkeletonBlock className="h-9 w-9 rounded-lg" delay={200} ariaLabel="Loading action button" />
                    </>
                )}
            </div>
        </div>
    );
}

// Stats Cards Skeleton - Matching DesktopStats/CollapsibleStats
function StatsCardsSkeleton({ 
    isMobile = false, 
    cardCount = 4 
}: { 
    isMobile?: boolean; 
    cardCount?: number;
}) {
    const validCardCount = useMemo(() => {
        return Math.max(1, Math.min(cardCount, 12)); // Clamp between 1 and 12
    }, [cardCount]);

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 animate-slide-down">
            {[...Array(validCardCount)].map((_, i) => (
                <Card 
                    key={i} 
                    className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 overflow-hidden"
                >
                    <CardContent className="p-4 md:p-5">
                        <div className="flex items-center justify-between mb-3">
                            <SkeletonBlock className="h-4 w-20" delay={i * 100} ariaLabel="Loading stat label" />
                            <SkeletonBlock className="h-8 w-8 rounded-xl" delay={50 + i * 100} ariaLabel="Loading stat icon" />
                        </div>
                        <SkeletonBlock className="h-8 w-16 mb-2" delay={100 + i * 100} ariaLabel="Loading stat value" />
                        <div className="flex items-center gap-1.5 pt-2 border-t border-gray-100 dark:border-gray-800">
                            <SkeletonBlock className="h-3 w-3 rounded-full" delay={150 + i * 100} ariaLabel="Loading trend indicator" />
                            <SkeletonBlock className="h-3 w-16" delay={200 + i * 100} ariaLabel="Loading trend text" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

// Filter Bar Skeleton - Matching ModernClearanceFilters
function FilterBarSkeleton({ isMobile = false }: { isMobile?: boolean }) {
    return (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50">
            <CardContent className="p-6">
                <div className="space-y-4">
                    <div className="relative">
                        <SkeletonBlock className="h-12 w-full rounded-xl" delay={0} ariaLabel="Loading search field" />
                    </div>
                    <div className={cn(
                        "grid gap-3",
                        isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-5"
                    )}>
                        {[...Array(4)].map((_, i) => (
                            <SkeletonBlock key={i} className="h-10 rounded-xl" delay={100 + i * 50} ariaLabel="Loading filter field" />
                        ))}
                        <SkeletonBlock className="h-10 rounded-xl" delay={300} ariaLabel="Loading filter button" />
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <SkeletonBlock className="h-2 w-2 rounded-full" delay={400} ariaLabel="Loading status indicator" />
                                <SkeletonBlock className="h-4 w-32" delay={450} ariaLabel="Loading filter summary" />
                            </div>
                            <SkeletonBlock className="h-8 w-20 rounded-lg" delay={500} ariaLabel="Loading clear button" />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// Tab Navigation Skeleton
function TabNavigationSkeleton() {
    return (
        <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700 pb-px overflow-x-auto">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-2 px-4 py-2.5 whitespace-nowrap">
                    <SkeletonBlock className="h-4 w-16" delay={i * 50} ariaLabel="Loading tab label" />
                    <SkeletonBlock className="h-5 w-6 rounded-full" delay={100 + i * 50} ariaLabel="Loading tab count" />
                </div>
            ))}
        </div>
    );
}

// Selection Banner Skeleton
function SelectionBannerSkeleton({ isMobile = false }: { isMobile?: boolean }) {
    return (
        <div className={cn(
            "flex items-center justify-between p-3 mb-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 animate-fade-in",
            isMobile && "flex-col gap-2"
        )}>
            <div className="flex items-center gap-3">
                <SkeletonBlock className="h-4 w-4" delay={0} ariaLabel="Loading checkbox" />
                <SkeletonBlock className="h-4 w-32" delay={50} ariaLabel="Loading selection count" />
            </div>
            <div className="flex gap-2">
                <SkeletonBlock className="h-8 w-20 rounded-lg" delay={100} ariaLabel="Loading action button" />
                <SkeletonBlock className="h-8 w-24 rounded-lg" delay={150} ariaLabel="Loading action button" />
            </div>
        </div>
    );
}

// Mobile Clearance Card Skeleton
function MobileClearanceCardSkeleton() {
    return (
        <div className="mb-2 last:mb-0 animate-fade-in">
            <Card className="border-0 shadow-md group bg-white dark:bg-gray-800">
                <CardContent className="p-3">
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                            <SkeletonBlock className="mt-0.5 w-4 h-4 rounded flex-shrink-0" delay={0} ariaLabel="Loading checkbox" />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                                    <SkeletonBlock className="h-4 w-24" delay={50} ariaLabel="Loading name" />
                                    <SkeletonBlock className="h-4 w-16 rounded-full" delay={100} ariaLabel="Loading badge" />
                                </div>
                                <SkeletonBlock className="h-4 w-32 mb-1" delay={150} ariaLabel="Loading ID" />
                                <SkeletonBlock className="h-3 w-48" delay={200} ariaLabel="Loading purpose" />
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <SkeletonBlock className="h-4 w-14 rounded-full" delay={250} ariaLabel="Loading status" />
                            <SkeletonBlock className="h-4 w-16 rounded-full" delay={300} ariaLabel="Loading type" />
                        </div>
                    </div>
                    <div className="flex items-center justify-between mb-1.5">
                        <div>
                            <SkeletonBlock className="h-3 w-16 mb-1" delay={350} ariaLabel="Loading date label" />
                            <SkeletonBlock className="h-5 w-20" delay={400} ariaLabel="Loading date value" />
                        </div>
                        <div className="flex items-center gap-1">
                            <SkeletonBlock className="h-3 w-3" delay={450} ariaLabel="Loading time icon" />
                            <SkeletonBlock className="h-3 w-24" delay={500} ariaLabel="Loading time" />
                        </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-md p-2 mb-2">
                        <div className="grid grid-cols-2 gap-1.5">
                            <div className="flex items-center gap-1.5">
                                <SkeletonBlock className="h-2.5 w-2.5 flex-shrink-0" delay={550} ariaLabel="Loading detail icon" />
                                <SkeletonBlock className="h-3 w-20" delay={600} ariaLabel="Loading detail" />
                            </div>
                            <div className="flex items-center gap-1.5">
                                <SkeletonBlock className="h-2.5 w-2.5 flex-shrink-0" delay={650} ariaLabel="Loading detail icon" />
                                <SkeletonBlock className="h-3 w-20" delay={700} ariaLabel="Loading detail" />
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-1.5 mt-2">
                        <SkeletonBlock className="h-7 flex-1 rounded-lg" delay={750} ariaLabel="Loading action button" />
                        <SkeletonBlock className="h-7 w-8 rounded-lg" delay={800} ariaLabel="Loading menu button" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

// Desktop Grid Card Skeleton
function DesktopGridCardSkeleton() {
    return (
        <div className="animate-fade-in">
            <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-200 group bg-white dark:bg-gray-800 h-full">
                <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 space-y-2">
                            <SkeletonBlock className="h-4 w-28" delay={0} ariaLabel="Loading category" />
                            <SkeletonBlock className="h-5 w-40" delay={50} ariaLabel="Loading name" />
                            <SkeletonBlock className="h-3 w-full" delay={100} ariaLabel="Loading purpose" />
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                            <SkeletonBlock className="h-5 w-16 rounded-full" delay={150} ariaLabel="Loading status" />
                            <SkeletonBlock className="h-5 w-20 rounded-full" delay={200} ariaLabel="Loading type" />
                        </div>
                    </div>
                    <div className="flex items-center justify-between mb-3 py-2 border-t border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-2">
                            <SkeletonBlock className="h-3 w-3 rounded-full" delay={250} ariaLabel="Loading orchestrator icon" />
                            <SkeletonBlock className="h-3 w-32" delay={300} ariaLabel="Loading orchestrator" />
                        </div>
                        <div className="text-right">
                            <SkeletonBlock className="h-3 w-12 mb-1" delay={350} ariaLabel="Loading date label" />
                            <SkeletonBlock className="h-5 w-16" delay={400} ariaLabel="Loading date" />
                        </div>
                    </div>
                    <div className="space-y-2 mb-3">
                        <div className="flex items-center gap-2">
                            <SkeletonBlock className="h-3 w-3" delay={450} ariaLabel="Loading detail icon" />
                            <SkeletonBlock className="h-3 w-32" delay={500} ariaLabel="Loading detail" />
                        </div>
                        <div className="flex items-center gap-2">
                            <SkeletonBlock className="h-3 w-3" delay={550} ariaLabel="Loading detail icon" />
                            <SkeletonBlock className="h-3 w-32" delay={600} ariaLabel="Loading detail" />
                        </div>
                    </div>
                    <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                        <SkeletonBlock className="h-8 flex-1 rounded-lg" delay={650} ariaLabel="Loading action button" />
                        <SkeletonBlock className="h-8 w-8 rounded-lg" delay={700} ariaLabel="Loading view button" />
                        <SkeletonBlock className="h-8 w-8 rounded-lg" delay={750} ariaLabel="Loading menu button" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

// Table Row Skeleton
function TableRowSkeleton({ hasCheckbox = false }: { hasCheckbox?: boolean }) {
    return (
        <TableRow className="group">
            {hasCheckbox && (
                <TableCell>
                    <SkeletonBlock className="h-4 w-4 rounded" delay={0} ariaLabel="Loading checkbox" />
                </TableCell>
            )}
            <TableCell>
                <div className="space-y-1">
                    <SkeletonBlock className="h-4 w-24" delay={50} ariaLabel="Loading name" />
                    <SkeletonBlock className="h-3 w-32" delay={100} ariaLabel="Loading subtitle" />
                </div>
            </TableCell>
            <TableCell>
                <div className="space-y-1">
                    <SkeletonBlock className="h-4 w-28" delay={150} ariaLabel="Loading field" />
                    <SkeletonBlock className="h-3 w-48" delay={200} ariaLabel="Loading field detail" />
                </div>
            </TableCell>
            <TableCell>
                <div className="space-y-1">
                    <div>
                        <SkeletonBlock className="h-3 w-16 mb-0.5" delay={250} ariaLabel="Loading date label" />
                        <SkeletonBlock className="h-3 w-20" delay={300} ariaLabel="Loading date" />
                    </div>
                    <div>
                        <SkeletonBlock className="h-3 w-16 mb-0.5" delay={350} ariaLabel="Loading time label" />
                        <SkeletonBlock className="h-3 w-20" delay={400} ariaLabel="Loading time" />
                    </div>
                </div>
            </TableCell>
            <TableCell>
                <SkeletonBlock className="h-5 w-16 rounded-full" delay={450} ariaLabel="Loading status" />
            </TableCell>
            <TableCell>
                <SkeletonBlock className="h-5 w-20 rounded-full" delay={500} ariaLabel="Loading type" />
            </TableCell>
            <TableCell>
                <SkeletonBlock className="h-5 w-16" delay={550} ariaLabel="Loading value" />
            </TableCell>
            <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                    <SkeletonBlock className="h-8 w-8 rounded-lg" delay={600} ariaLabel="Loading action button" />
                    <SkeletonBlock className="h-8 w-8 rounded-lg" delay={650} ariaLabel="Loading action button" />
                    <SkeletonBlock className="h-8 w-8 rounded-lg" delay={700} ariaLabel="Loading action button" />
                </div>
            </TableCell>
        </TableRow>
    );
}

// Table Skeleton
function TableSkeleton({
    rows = 5,
    hasCheckbox = false,
}: {
    rows?: number;
    hasCheckbox?: boolean;
}) {
    const validRows = useMemo(() => Math.max(1, Math.min(rows, 50)), [rows]);

    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent">
                        {hasCheckbox && (
                            <TableHead className="w-12">
                                <SkeletonBlock className="h-4 w-4 rounded" delay={0} ariaLabel="Loading checkbox" />
                            </TableHead>
                        )}
                        <TableHead><SkeletonBlock className="h-4 w-28" delay={50} ariaLabel="Loading column header" /></TableHead>
                        <TableHead><SkeletonBlock className="h-4 w-24" delay={100} ariaLabel="Loading column header" /></TableHead>
                        <TableHead><SkeletonBlock className="h-4 w-16" delay={150} ariaLabel="Loading column header" /></TableHead>
                        <TableHead><SkeletonBlock className="h-4 w-16" delay={200} ariaLabel="Loading column header" /></TableHead>
                        <TableHead><SkeletonBlock className="h-4 w-16" delay={250} ariaLabel="Loading column header" /></TableHead>
                        <TableHead><SkeletonBlock className="h-4 w-12" delay={300} ariaLabel="Loading column header" /></TableHead>
                        <TableHead className="text-right"><SkeletonBlock className="h-4 w-16 ml-auto" delay={350} ariaLabel="Loading actions header" /></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {[...Array(validRows)].map((_, i) => (
                        <TableRowSkeleton key={i} hasCheckbox={hasCheckbox} />
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

// Pagination Skeleton
function PaginationSkeleton() {
    return (
        <div className="flex items-center justify-between">
            <SkeletonBlock className="h-4 w-40" delay={0} ariaLabel="Loading pagination info" />
            <div className="flex items-center gap-1">
                <SkeletonBlock className="h-8 w-8 rounded-lg" delay={50} ariaLabel="Loading previous button" />
                {[...Array(3)].map((_, i) => (
                    <SkeletonBlock key={i} className="h-8 w-8 rounded-lg" delay={100 + i * 25} ariaLabel="Loading page button" />
                ))}
                <SkeletonBlock className="h-8 w-8 rounded-lg" delay={200} ariaLabel="Loading next button" />
            </div>
        </div>
    );
}

// Empty State Skeleton
function EmptyStateSkeleton() {
    return (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <SkeletonBlock className="h-16 w-16 rounded-2xl" delay={0} ariaLabel="Loading icon" />
            <div className="space-y-2 text-center">
                <SkeletonBlock className="h-6 w-48 mx-auto" delay={100} ariaLabel="Loading title" />
                <SkeletonBlock className="h-4 w-64 mx-auto" delay={150} ariaLabel="Loading description" />
            </div>
            <SkeletonBlock className="h-10 w-32 rounded-lg" delay={200} ariaLabel="Loading action button" />
        </div>
    );
}

// List Item Skeleton
function ListItemSkeleton({ hasImage = false }: { hasImage?: boolean }) {
    return (
        <div className="flex items-center gap-4 p-4 border-b border-gray-100 dark:border-gray-800">
            {hasImage && <SkeletonBlock className="h-12 w-12 rounded-full flex-shrink-0" delay={0} ariaLabel="Loading avatar" />}
            <div className="flex-1 space-y-2">
                <SkeletonBlock className="h-4 w-3/4" delay={50} ariaLabel="Loading name" />
                <SkeletonBlock className="h-3 w-1/2" delay={100} ariaLabel="Loading detail" />
            </div>
            <SkeletonBlock className="h-8 w-8 rounded-lg flex-shrink-0" delay={150} ariaLabel="Loading action button" />
        </div>
    );
}

// Filters Panel Skeleton
function FiltersPanelSkeleton({ fieldCount = 5 }: { fieldCount?: number }) {
    const validFieldCount = useMemo(() => Math.max(1, Math.min(fieldCount, 20)), [fieldCount]);

    return (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50">
            <CardContent className="p-6 space-y-4">
                {[...Array(validFieldCount)].map((_, i) => (
                    <div key={i} className="space-y-2">
                        <SkeletonBlock className="h-4 w-24" delay={i * 50} ariaLabel="Loading field label" />
                        <SkeletonBlock className="h-10 w-full rounded-xl" delay={100 + i * 50} ariaLabel="Loading field input" />
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

// Profile Card Skeleton
function ProfileCardSkeleton({ isMobile = false, hasImage = true }: { isMobile?: boolean; hasImage?: boolean }) {
    return (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
            <CardContent className="p-6">
                <div className={cn(
                    "flex gap-6 items-center",
                    isMobile && "flex-col text-center"
                )}>
                    {hasImage && (
                        <SkeletonBlock className="h-24 w-24 rounded-full flex-shrink-0" delay={0} ariaLabel="Loading profile picture" />
                    )}
                    <div className="space-y-2 flex-1">
                        <SkeletonBlock className={cn("h-6 w-48", isMobile && "mx-auto")} delay={100} ariaLabel="Loading name" />
                        <SkeletonBlock className={cn("h-4 w-32", isMobile && "mx-auto")} delay={150} ariaLabel="Loading role" />
                        <SkeletonBlock className={cn("h-4 w-64", isMobile && "mx-auto")} delay={200} ariaLabel="Loading description" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// Form Skeleton
function FormSkeleton({ 
    isMobile = false, 
    fieldCount = 8 
}: { 
    isMobile?: boolean; 
    fieldCount?: number;
}) {
    const validFieldCount = useMemo(() => Math.max(1, Math.min(fieldCount, 30)), [fieldCount]);

    return (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
            <CardContent className="p-6 space-y-6">
                <SkeletonBlock className="h-7 w-64" delay={0} ariaLabel="Loading form title" />
                <div className={cn(
                    "grid gap-4",
                    isMobile ? "grid-cols-1" : "grid-cols-2"
                )}>
                    {[...Array(validFieldCount)].map((_, i) => (
                        <div key={i} className="space-y-2">
                            <SkeletonBlock className="h-4 w-20" delay={50 + i * 30} ariaLabel="Loading field label" />
                            <SkeletonBlock className="h-10 w-full rounded-xl" delay={100 + i * 30} ariaLabel="Loading field input" />
                        </div>
                    ))}
                </div>
                <div className="flex justify-end gap-3">
                    <SkeletonBlock className="h-10 w-24 rounded-lg" delay={400} ariaLabel="Loading cancel button" />
                    <SkeletonBlock className="h-10 w-32 rounded-lg bg-gradient-to-r from-blue-400 to-blue-600" delay={450} ariaLabel="Loading submit button" />
                </div>
            </CardContent>
        </Card>
    );
}

// Detail View Skeleton
function DetailViewSkeleton({ isMobile = false, hasImage = true, fieldCount = 5 }: { isMobile?: boolean; hasImage?: boolean; fieldCount?: number }) {
    const validFieldCount = useMemo(() => Math.max(1, Math.min(fieldCount, 20)), [fieldCount]);

    return (
        <div className="space-y-4 md:space-y-6">
            <HeaderSectionSkeleton isMobile={isMobile} />
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
                <CardContent className="p-6">
                    <div className={cn(
                        "flex gap-6",
                        isMobile && "flex-col"
                    )}>
                        {hasImage && (
                            <SkeletonBlock className={cn(
                                "rounded-lg flex-shrink-0",
                                isMobile ? "h-32 w-full" : "h-48 w-48"
                            )} delay={0} ariaLabel="Loading detail image" />
                        )}
                        <div className="flex-1 space-y-3">
                            <SkeletonBlock className="h-6 w-3/4" delay={50} ariaLabel="Loading title" />
                            <SkeletonBlock className="h-4 w-1/2" delay={100} ariaLabel="Loading subtitle" />
                            <SkeletonBlock className="h-4 w-full" delay={150} ariaLabel="Loading description" />
                            <SkeletonBlock className="h-4 w-full" delay={200} ariaLabel="Loading description" />
                            <SkeletonBlock className="h-4 w-2/3" delay={250} ariaLabel="Loading description" />
                            
                            <div className="grid grid-cols-2 gap-4 pt-4">
                                {[...Array(validFieldCount)].map((_, i) => (
                                    <div key={i} className="space-y-1">
                                        <SkeletonBlock className="h-3 w-16" delay={300 + i * 30} ariaLabel="Loading field label" />
                                        <SkeletonBlock className="h-4 w-24" delay={350 + i * 30} ariaLabel="Loading field value" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

// Quick Action Card Skeleton
function QuickActionCardSkeleton() {
    return (
        <div className="animate-fade-in">
            <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-200 group bg-white dark:bg-gray-800 h-full">
                <CardContent className="p-3 md:p-4">
                    <div className="flex items-start gap-3 mb-3">
                        <SkeletonBlock className="h-10 w-10 rounded-xl flex-shrink-0" delay={0} ariaLabel="Loading action icon" />
                        <div className="flex-1 space-y-1.5">
                            <SkeletonBlock className="h-4 w-24" delay={50} ariaLabel="Loading action title" />
                            <SkeletonBlock className="h-3 w-32" delay={100} ariaLabel="Loading action description" />
                        </div>
                        <SkeletonBlock className="h-5 w-8 rounded-full flex-shrink-0" delay={150} ariaLabel="Loading badge" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

// Activity Feed Item Skeleton
function ActivityFeedItemSkeleton() {
    return (
        <div className="flex items-start gap-3 p-3">
            <SkeletonBlock className="h-10 w-10 rounded-full flex-shrink-0" delay={0} ariaLabel="Loading user avatar" />
            <div className="flex-1 space-y-1.5">
                <SkeletonBlock className="h-4 w-3/4" delay={50} ariaLabel="Loading activity title" />
                <SkeletonBlock className="h-3 w-1/2" delay={100} ariaLabel="Loading activity description" />
                <div className="flex items-center gap-2">
                    <SkeletonBlock className="h-5 w-16 rounded-full" delay={150} ariaLabel="Loading activity type" />
                    <SkeletonBlock className="h-3 w-20" delay={200} ariaLabel="Loading activity time" />
                </div>
            </div>
        </div>
    );
}

// Activity Feed Skeleton
function ActivityFeedSkeleton({ count = 3 }: { count?: number }) {
    const validCount = useMemo(() => Math.max(1, Math.min(count, 20)), [count]);

    return (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
            <CardContent className="p-0">
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {[...Array(validCount)].map((_, i) => (
                        <ActivityFeedItemSkeleton key={i} />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

// Transaction Item Skeleton
function TransactionItemSkeleton() {
    return (
        <div className="flex items-center justify-between py-2">
            <div className="flex items-start gap-3 flex-1 min-w-0">
                <SkeletonBlock className="h-8 w-8 rounded-lg flex-shrink-0" delay={0} ariaLabel="Loading transaction icon" />
                <div className="flex-1 min-w-0 space-y-1">
                    <SkeletonBlock className="h-4 w-32" delay={50} ariaLabel="Loading transaction name" />
                    <SkeletonBlock className="h-3 w-24" delay={100} ariaLabel="Loading transaction detail" />
                </div>
            </div>
            <div className="text-right flex-shrink-0 space-y-1">
                <SkeletonBlock className="h-4 w-16 ml-auto" delay={150} ariaLabel="Loading amount" />
                <SkeletonBlock className="h-3 w-12 ml-auto" delay={200} ariaLabel="Loading time" />
            </div>
        </div>
    );
}

// Event Card Skeleton
function EventCardSkeleton() {
    return (
        <div className="animate-fade-in">
            <Card className="border-0 shadow-md bg-white dark:bg-gray-800 overflow-hidden">
                <CardContent className="p-4">
                    <div className="flex gap-3">
                        <div className="text-center flex-shrink-0">
                            <SkeletonBlock className="h-4 w-12 mb-1" delay={0} ariaLabel="Loading month" />
                            <SkeletonBlock className="h-8 w-12" delay={50} ariaLabel="Loading date" />
                        </div>
                        <div className="flex-1 space-y-2">
                            <SkeletonBlock className="h-4 w-3/4" delay={100} ariaLabel="Loading event title" />
                            <div className="flex items-center gap-2">
                                <SkeletonBlock className="h-3 w-3" delay={150} ariaLabel="Loading time icon" />
                                <SkeletonBlock className="h-3 w-24" delay={200} ariaLabel="Loading event time" />
                            </div>
                            <div className="flex items-center gap-2">
                                <SkeletonBlock className="h-3 w-3" delay={250} ariaLabel="Loading location icon" />
                                <SkeletonBlock className="h-3 w-32" delay={300} ariaLabel="Loading event location" />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

// Emergency Contact Card Skeleton
function EmergencyContactCardSkeleton() {
    return (
        <div className="animate-fade-in">
            <Card className="border-0 shadow-md bg-white dark:bg-gray-800 h-full">
                <CardContent className="p-3 md:p-4">
                    <div className="flex items-center gap-3">
                        <SkeletonBlock className="h-10 w-10 rounded-full flex-shrink-0" delay={0} ariaLabel="Loading contact avatar" />
                        <div className="flex-1 space-y-1.5">
                            <SkeletonBlock className="h-4 w-20" delay={50} ariaLabel="Loading contact name" />
                            <SkeletonBlock className="h-3 w-24" delay={100} ariaLabel="Loading contact role" />
                        </div>
                    </div>
                    <SkeletonBlock className="h-8 w-full rounded-lg mt-3" delay={150} ariaLabel="Loading call button" />
                </CardContent>
            </Card>
        </div>
    );
}

// Service Tile Skeleton
function ServiceTileSkeleton() {
    return (
        <div className="animate-fade-in">
            <Card className="border-0 shadow-sm bg-white dark:bg-gray-800 hover:shadow-md transition-all h-full">
                <CardContent className="p-3 flex flex-col items-center text-center space-y-2">
                    <SkeletonBlock className="h-10 w-10 rounded-xl" delay={0} ariaLabel="Loading service icon" />
                    <SkeletonBlock className="h-3 w-16" delay={50} ariaLabel="Loading service name" />
                    <SkeletonBlock className="h-5 w-6 rounded-full" delay={100} ariaLabel="Loading service count" />
                </CardContent>
            </Card>
        </div>
    );
}

// Banner Header Skeleton
function BannerHeaderSkeleton() {
    return (
        <div className="relative w-full h-48 md:h-64 lg:h-72 rounded-2xl overflow-hidden shadow-xl animate-fade-in">
            <SkeletonBlock className="w-full h-full rounded-2xl" delay={0} animate={false} ariaLabel="Loading banner image" />
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                <div className="space-y-2">
                    <SkeletonBlock className="h-6 w-48 md:w-64 bg-gray-300 dark:bg-gray-600" delay={100} ariaLabel="Loading banner title" />
                    <SkeletonBlock className="h-4 w-32 md:w-40 bg-gray-300 dark:bg-gray-600" delay={150} ariaLabel="Loading banner subtitle" />
                </div>
                <div className="flex gap-2 mt-4">
                    {[...Array(4)].map((_, i) => (
                        <SkeletonBlock key={i} className="h-2 w-8 rounded-full bg-gray-300 dark:bg-gray-600" delay={200 + i * 25} ariaLabel="Loading indicator" />
                    ))}
                </div>
            </div>
        </div>
    );
}

// Dashboard Tab Navigation Skeleton
function DashboardTabNavigationSkeleton({ isMobile = false }: { isMobile?: boolean }) {
    if (isMobile) {
        return (
            <SkeletonBlock className="h-11 w-full rounded-xl" delay={0} ariaLabel="Loading tab navigation" />
        );
    }
    
    return (
        <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
            {[...Array(4)].map((_, i) => (
                <SkeletonBlock key={i} className="h-9 w-24 rounded-lg" delay={i * 50} ariaLabel="Loading tab" />
            ))}
        </div>
    );
}

// Date Filter Skeleton
function DateFilterSkeleton({ isMobile = false }: { isMobile?: boolean }) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                    <SkeletonBlock 
                        key={i} 
                        className={cn(
                            "h-8 rounded-md",
                            isMobile && i > 0 ? "hidden" : "w-20",
                            !isMobile && "w-20"
                        )} 
                        delay={i * 50}
                        ariaLabel="Loading date filter" 
                    />
                ))}
            </div>
            <SkeletonBlock className="h-6 w-32 rounded-full" delay={300} ariaLabel="Loading date display" />
        </div>
    );
}

// Dashboard Skeleton - Full page matching Dashboard.tsx
function DashboardSkeleton({ 
    isMobile = false, 
    count = 6,
    hasStats = true,
    fields = 2,
    hasBanner = true 
}: { 
    isMobile?: boolean; 
    count?: number;
    hasStats?: boolean;
    fields?: number;
    hasBanner?: boolean;
}) {
    const validCount = useMemo(() => Math.max(1, Math.min(count, 20)), [count]);
    const validFields = useMemo(() => Math.max(1, Math.min(fields, 10)), [fields]);

    return (
        <div className="relative max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 space-y-4 sm:space-y-6 md:space-y-8 pb-24 lg:pb-8">
            
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div className="space-y-2">
                    <SkeletonBlock className="h-7 w-64 md:w-80" delay={0} ariaLabel="Loading dashboard title" />
                    <SkeletonBlock className="h-4 w-48 md:w-72" delay={50} ariaLabel="Loading dashboard subtitle" />
                </div>
            </div>

            {/* Banner Header */}
            {hasBanner && <BannerHeaderSkeleton />}

            {/* Tab Navigation */}
            <div className="mb-2 sm:mb-4">
                <DashboardTabNavigationSkeleton isMobile={isMobile} />
            </div>

            {/* Date Filter */}
            <DateFilterSkeleton isMobile={isMobile} />

            {/* Stats Grid */}
            {hasStats && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-5">
                    {[...Array(4)].map((_, i) => (
                        <StatsCardsSkeleton key={i} cardCount={1} />
                    ))}
                </div>
            )}

            {/* Quick Actions */}
            <section className="space-y-2 sm:space-y-3 md:space-y-4">
                <div className="flex items-center justify-between">
                    <SkeletonBlock className="h-6 w-32" delay={0} ariaLabel="Loading section title" />
                    <SkeletonBlock className="h-5 w-5 rounded-full" delay={50} ariaLabel="Loading menu" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                    {[...Array(4)].map((_, i) => (
                        <QuickActionCardSkeleton key={i} />
                    ))}
                </div>
            </section>

            {/* Mobile Section Tabs */}
            {isMobile && (
                <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
                    <SkeletonBlock className="flex-1 h-10 rounded-lg" delay={0} ariaLabel="Loading mobile tab" />
                    <SkeletonBlock className="flex-1 h-10 rounded-lg" delay={50} ariaLabel="Loading mobile tab" />
                </div>
            )}

            {/* Activity & Transactions - Desktop */}
            <div className="hidden lg:grid lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
                <section className="space-y-2 sm:space-y-3 md:space-y-4">
                    <div className="flex items-center justify-between">
                        <SkeletonBlock className="h-6 w-36" delay={0} ariaLabel="Loading section title" />
                        <SkeletonBlock className="h-4 w-16" delay={50} ariaLabel="Loading link" />
                    </div>
                    <ActivityFeedSkeleton count={3} />
                </section>

                <section className="space-y-2 sm:space-y-3 md:space-y-4">
                    <div className="flex items-center justify-between">
                        <SkeletonBlock className="h-6 w-40" delay={0} ariaLabel="Loading section title" />
                        <SkeletonBlock className="h-4 w-16" delay={50} ariaLabel="Loading link" />
                    </div>
                    <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
                        <CardContent className="p-0">
                            <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="p-3 sm:p-4">
                                        <TransactionItemSkeleton />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </section>
            </div>

            {/* Mobile Layout */}
            <div className="lg:hidden">
                <section className="space-y-2 sm:space-y-3 md:space-y-4">
                    <div className="flex items-center justify-between">
                        <SkeletonBlock className="h-6 w-36" delay={0} ariaLabel="Loading section title" />
                        <SkeletonBlock className="h-4 w-16" delay={50} ariaLabel="Loading link" />
                    </div>
                    <ActivityFeedSkeleton count={3} />
                </section>
            </div>

            {/* Announcements Section (when no banner) */}
            {!hasBanner && (
                <section className="space-y-2 sm:space-y-3 md:space-y-4">
                    <div className="flex items-center justify-between">
                        <SkeletonBlock className="h-6 w-36" delay={0} ariaLabel="Loading section title" />
                        <SkeletonBlock className="h-4 w-16" delay={50} ariaLabel="Loading link" />
                    </div>
                    <div className="space-y-2 sm:space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <Card key={i} className="border-0 shadow-md bg-white dark:bg-gray-800">
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-3">
                                        <SkeletonBlock className="h-10 w-10 rounded-xl flex-shrink-0" delay={i * 50} ariaLabel="Loading announcement icon" />
                                        <div className="flex-1 space-y-2">
                                            <SkeletonBlock className="h-4 w-3/4" delay={50 + i * 50} ariaLabel="Loading announcement title" />
                                            <SkeletonBlock className="h-3 w-full" delay={100 + i * 50} ariaLabel="Loading announcement content" />
                                            <SkeletonBlock className="h-3 w-2/3" delay={150 + i * 50} ariaLabel="Loading announcement content" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>
            )}

            {/* Upcoming Events */}
            <section className="space-y-2 sm:space-y-3 md:space-y-4">
                <div className="flex items-center justify-between">
                    <SkeletonBlock className="h-6 w-40" delay={0} ariaLabel="Loading section title" />
                    <SkeletonBlock className="h-4 w-16" delay={50} ariaLabel="Loading link" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3">
                    {[...Array(4)].map((_, i) => (
                        <EventCardSkeleton key={i} />
                    ))}
                </div>
            </section>

            {/* Emergency Contacts */}
            <section className="space-y-2 sm:space-y-3 md:space-y-4">
                <SkeletonBlock className="h-6 w-44" delay={0} ariaLabel="Loading section title" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                    {[...Array(4)].map((_, i) => (
                        <EmergencyContactCardSkeleton key={i} />
                    ))}
                </div>
            </section>

            {/* All Services */}
            <section className="space-y-2 sm:space-y-3 md:space-y-4">
                <SkeletonBlock className="h-6 w-32" delay={0} ariaLabel="Loading section title" />
                <div className="grid grid-cols-4 gap-1 sm:gap-2 md:gap-3">
                    {[...Array(8)].map((_, i) => (
                        <ServiceTileSkeleton key={i} />
                    ))}
                </div>
            </section>
        </div>
    );
}

// Universal Skeleton - Main export that handles all variant types
function UniversalSkeleton({
    variant = 'card',
    isMobile = false,
    hasStats = false,
    hasFilters = false,
    hasHeader = false,
    hasAction = false,
    hasImage = false,
    count = 5,
    fields = 3,
    density = 'default',
}: UniversalSkeletonProps) {
    // Validate inputs on mount and prop changes
    useEffect(() => {
        const validVariants = ['card', 'list', 'table', 'grid', 'detail', 'form', 'stats', 'profile', 'filters', 'dashboard'];
        if (!validVariants.includes(variant)) {
            console.error(`Invalid variant: ${variant}. Must be one of: ${validVariants.join(', ')}`);
        }
        
        if (count < 1 || count > 100) {
            console.error(`Count must be between 1 and 100, got: ${count}. Clamping value.`);
        }
        
        if (fields < 1 || fields > 50) {
            console.error(`Fields must be between 1 and 50, got: ${fields}. Clamping value.`);
        }
        
        const validDensities = ['compact', 'default', 'comfortable'];
        if (!validDensities.includes(density)) {
            console.error(`Invalid density: ${density}. Must be one of: ${validDensities.join(', ')}`);
        }
    }, [variant, count, fields, density]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            // Framer Motion handles animation cleanup internally
        };
    }, []);

    // Calculate spacing based on density
    const spacing = useMemo(() => {
        switch (density) {
            case 'compact': return 'space-y-2 md:space-y-3';
            case 'comfortable': return 'space-y-6 md:space-y-8';
            default: return 'space-y-4 md:space-y-6';
        }
    }, [density]);

    // Clamp count and fields to safe ranges
    const safeCount = useMemo(() => Math.max(1, Math.min(count, 100)), [count]);
    const safeFields = useMemo(() => Math.max(1, Math.min(fields, 50)), [fields]);

    const renderContent = () => {
        switch (variant) {
            case 'dashboard':
                return <DashboardSkeleton isMobile={isMobile} count={safeCount} hasStats={true} hasBanner={hasImage} />;
            
            case 'card':
                return (
                    <div className={cn(spacing, "pb-28 md:pb-6")}>
                        {hasHeader && <HeaderSectionSkeleton isMobile={isMobile} />}
                        {hasStats && <StatsCardsSkeleton isMobile={isMobile} cardCount={4} />}
                        {hasFilters && <FilterBarSkeleton isMobile={isMobile} />}
                        {hasAction && <SelectionBannerSkeleton isMobile={isMobile} />}
                        <div className="mt-4">
                            <TabNavigationSkeleton />
                            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 mt-4">
                                <CardContent className="p-4 md:p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <SkeletonBlock className="h-5 w-32" delay={0} ariaLabel="Loading section title" />
                                        <div className="flex items-center gap-2">
                                            <SkeletonBlock className="h-8 w-8 rounded-lg" delay={50} ariaLabel="Loading view toggle" />
                                            <SkeletonBlock className="h-8 w-8 rounded-lg" delay={100} ariaLabel="Loading filter button" />
                                        </div>
                                    </div>
                                    {isMobile ? (
                                        <div className="pb-4 space-y-0">
                                            {[...Array(safeCount)].map((_, i) => (
                                                <MobileClearanceCardSkeleton key={i} />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {[...Array(safeCount)].map((_, i) => (
                                                <DesktopGridCardSkeleton key={i} />
                                            ))}
                                        </div>
                                    )}
                                    <div className="mt-6">
                                        <PaginationSkeleton />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                        {isMobile && (
                            <div className="fixed bottom-20 right-6 z-50 animate-scale-in">
                                <SkeletonBlock className="h-14 w-14 rounded-full shadow-xl" delay={0} ariaLabel="Loading FAB" />
                            </div>
                        )}
                    </div>
                );
            
            case 'table':
                return (
                    <div className={cn(spacing, "pb-28 md:pb-6")}>
                        {hasHeader && <HeaderSectionSkeleton isMobile={isMobile} />}
                        {hasFilters && <FilterBarSkeleton isMobile={isMobile} />}
                        {hasAction && <SelectionBannerSkeleton isMobile={isMobile} />}
                        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
                            <CardContent className="p-4 md:p-6">
                                <TableSkeleton rows={safeCount} hasCheckbox={hasAction} />
                                <div className="mt-6">
                                    <PaginationSkeleton />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                );
            
            case 'grid':
                return (
                    <div className={cn(spacing, "pb-28 md:pb-6")}>
                        {hasHeader && <HeaderSectionSkeleton isMobile={isMobile} />}
                        {hasAction && <SelectionBannerSkeleton isMobile={isMobile} />}
                        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
                            <CardContent className="p-4 md:p-6">
                                <div className={cn(
                                    "grid gap-4",
                                    isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                                )}>
                                    {[...Array(safeCount)].map((_, i) => (
                                        isMobile ? <MobileClearanceCardSkeleton key={i} /> : <DesktopGridCardSkeleton key={i} />
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                );
            
            case 'detail':
                return <DetailViewSkeleton isMobile={isMobile} hasImage={hasImage} fieldCount={safeFields} />;
            
            case 'form':
                return (
                    <div className={spacing}>
                        {hasHeader && <HeaderSectionSkeleton isMobile={isMobile} />}
                        <FormSkeleton isMobile={isMobile} fieldCount={safeFields} />
                    </div>
                );
            
            case 'stats':
                return <StatsCardsSkeleton isMobile={isMobile} cardCount={safeCount} />;
            
            case 'profile':
                return (
                    <div className={spacing}>
                        {hasHeader && <HeaderSectionSkeleton isMobile={isMobile} />}
                        <ProfileCardSkeleton isMobile={isMobile} hasImage={hasImage} />
                        <FormSkeleton isMobile={isMobile} fieldCount={safeFields} />
                    </div>
                );
            
            case 'filters':
                return (
                    <div className={spacing}>
                        <FiltersPanelSkeleton fieldCount={safeFields} />
                    </div>
                );
            
            case 'list':
                return (
                    <div className={cn(spacing, "pb-28 md:pb-6")}>
                        {hasHeader && <HeaderSectionSkeleton isMobile={isMobile} />}
                        {hasAction && <SelectionBannerSkeleton isMobile={isMobile} />}
                        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
                            <CardContent className="p-0">
                                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {[...Array(safeCount)].map((_, i) => (
                                        <ListItemSkeleton key={i} hasImage={hasImage} />
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                );
            
            default:
                return <DashboardSkeleton isMobile={isMobile} count={safeCount} hasStats={hasStats} hasBanner={hasImage} />;
        }
    };

    return renderContent();
}

// Export all skeletons
export { 
    UniversalSkeleton,
    DashboardSkeleton,
    QuickActionCardSkeleton,
    ActivityFeedSkeleton,
    ActivityFeedItemSkeleton,
    TransactionItemSkeleton,
    EventCardSkeleton,
    EmergencyContactCardSkeleton,
    ServiceTileSkeleton,
    BannerHeaderSkeleton,
    DashboardTabNavigationSkeleton,
    DateFilterSkeleton,
    StatsCardsSkeleton,
    HeaderSectionSkeleton,
    FilterBarSkeleton,
    TabNavigationSkeleton,
    SelectionBannerSkeleton,
    MobileClearanceCardSkeleton,
    DesktopGridCardSkeleton,
    TableSkeleton,
    TableRowSkeleton,
    PaginationSkeleton,
    EmptyStateSkeleton,
    ListItemSkeleton,
    FiltersPanelSkeleton,
    ProfileCardSkeleton,
    FormSkeleton,
    DetailViewSkeleton,
    SkeletonBlock
};

export default UniversalSkeleton;