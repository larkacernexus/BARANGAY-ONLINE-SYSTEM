import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { EmptyState } from '@/components/adminui/empty-state';
import { GridLayout } from '@/components/adminui/grid-layout';
import { Home, Users, Phone, Eye, Edit, Trash2, Clipboard, MapPin, ChevronDown, ChevronUp, ExternalLink, Copy, User, Calendar } from 'lucide-react';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import { getPurokName, getStatusBadgeVariant, truncateText, truncateAddress, formatContactNumber } from '../../../admin-utils/householdUtils';

interface HouseholdsGridViewProps {
    households: any[];
    isBulkMode: boolean;
    selectedHouseholds: number[];
    isMobile: boolean;
    onItemSelect: (id: number) => void;
    hasActiveFilters: boolean;
    onClearFilters: () => void;
    onDelete: (household: any) => void;
    onCopyToClipboard: (text: string, label: string) => void;
    puroks: any[];
}

// Status color classes matching community reports pattern
const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
        case 'active':
            return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
        case 'inactive':
            return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
    }
};

const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

export default function HouseholdsGridView({
    households,
    isBulkMode,
    selectedHouseholds,
    isMobile,
    onItemSelect,
    hasActiveFilters,
    onClearFilters,
    onDelete,
    onCopyToClipboard,
    puroks
}: HouseholdsGridViewProps) {
    const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
    
    const isCompactView = isMobile;

    // Toggle card expansion
    const toggleCardExpansion = (id: number, e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }
        setExpandedCards(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    // Handle card click
    const handleCardClick = (householdId: number, e: React.MouseEvent) => {
        if (isBulkMode) {
            e.stopPropagation();
            return;
        }
        e.stopPropagation();
        toggleCardExpansion(householdId);
    };

    // Handle view details
    const handleViewDetails = (householdId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        window.location.href = `/admin/households/${householdId}`;
    };

    // Handle edit
    const handleEdit = (householdId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        window.location.href = `/admin/households/${householdId}/edit`;
    };

    // Create empty state component
    const emptyState = (
        <EmptyState
            title="No households found"
            description={hasActiveFilters 
                ? 'Try changing your filters or search criteria.'
                : 'Get started by registering a household.'}
            icon={<Home className="h-12 w-12 text-gray-300 dark:text-gray-700" />}
            hasFilters={hasActiveFilters}
            onClearFilters={onClearFilters}
            onCreateNew={() => router.get('/admin/households/create')}
            createLabel="Register Household"
        />
    );

    return (
        <GridLayout
            isEmpty={households.length === 0}
            emptyState={emptyState}
            gridCols={{ base: 1, sm: 2, lg: 3, xl: 4 }}
            gap={{ base: '3', sm: '4' }}
            padding="p-4"
        >
            {households.map(household => {
                const isSelected = selectedHouseholds.includes(household.id);
                const isExpanded = expandedCards.has(household.id);
                
                // Truncation lengths based on view
                const nameLength = isCompactView ? 20 : 30;
                const addressLength = isCompactView ? 25 : 40;
                
                return (
                    <Card 
                        key={household.id}
                        className={`overflow-hidden border relative transition-all duration-200 bg-white dark:bg-gray-900 ${
                            isSelected 
                                ? 'ring-2 ring-blue-500 border-blue-500 shadow-lg shadow-blue-500/20 dark:ring-blue-400 dark:border-blue-400 dark:shadow-blue-400/20' 
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-gray-800/50'
                        } ${isExpanded ? 'shadow-lg' : ''} cursor-pointer`}
                        onClick={(e) => handleCardClick(household.id, e)}
                    >
                        {/* Bulk selection checkbox */}
                        {isBulkMode && (
                            <div 
                                className="absolute top-2 left-2 z-20"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onItemSelect(household.id);
                                }}
                            >
                                <Checkbox
                                    checked={isSelected}
                                    onCheckedChange={() => onItemSelect(household.id)}
                                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 shadow-sm h-4 w-4"
                                />
                            </div>
                        )}

                        <CardContent className={`p-3 ${isCompactView && !isExpanded ? 'pb-1' : ''} bg-white dark:bg-gray-900`}>
                            {/* Header row with icon and household number */}
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                    <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex-shrink-0">
                                        <Home className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <span 
                                        className="font-medium text-xs text-blue-600 dark:text-blue-400 truncate hover:text-blue-700 dark:hover:text-blue-300 cursor-help"
                                        title={`Household: ${household.household_number}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onCopyToClipboard(household.household_number, 'Household Number');
                                        }}
                                    >
                                        {household.household_number}
                                    </span>
                                </div>
                                
                                {/* Status badge */}
                                <div className="flex gap-1 flex-shrink-0">
                                    <Badge 
                                        variant="outline" 
                                        className={`text-[10px] px-1.5 py-0 h-4 border ${getStatusColor(household.status)}`}
                                    >
                                        {household.status}
                                    </Badge>
                                </div>
                            </div>
                            
                            {/* Head of Family - always visible */}
                            <h3 
                                className="font-semibold text-sm mb-1.5 line-clamp-2 text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-200"
                                title={household.head_of_family}
                                onClick={(e) => handleViewDetails(household.id, e)}
                            >
                                {truncateText(household.head_of_family, nameLength)}
                            </h3>
                            
                            {/* Primary Info - always visible */}
                            <div className="space-y-1.5 mb-2">
                                {/* Address */}
                                {household.address && (
                                    <div className="flex items-center gap-1.5">
                                        <MapPin className="h-3 w-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                        <span 
                                            className="text-xs text-gray-700 dark:text-gray-300 truncate"
                                            title={household.address}
                                        >
                                            {truncateAddress(household.address, addressLength)}
                                        </span>
                                    </div>
                                )}
                                
                                {/* Purok */}
                                <div className="flex items-center gap-1.5">
                                    <Home className="h-3 w-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                    <span className="text-xs text-gray-700 dark:text-gray-300">
                                        {getPurokName(household, puroks)}
                                    </span>
                                </div>
                                
                                {/* Member count */}
                                <div className="flex items-center gap-1.5">
                                    <Users className="h-3 w-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                    <span className="text-xs text-gray-700 dark:text-gray-300">
                                        {household.member_count || 0} member{household.member_count !== 1 ? 's' : ''}
                                    </span>
                                </div>
                                
                                {/* Contact number */}
                                {household.contact_number && (
                                    <div className="flex items-center gap-1.5">
                                        <Phone className="h-3 w-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                        <span className="text-xs text-gray-700 dark:text-gray-300">
                                            {formatContactNumber(household.contact_number)}
                                        </span>
                                    </div>
                                )}
                            </div>
                            
                            {/* Expand/Collapse indicator */}
                            {!isBulkMode && !isExpanded && (
                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        Click to view details
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                                        onClick={(e) => toggleCardExpansion(household.id, e)}
                                    >
                                        <ChevronDown className="h-3 w-3" />
                                    </Button>
                                </div>
                            )}

                            {/* Expanded Details */}
                            {isExpanded && (
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-2 space-y-2 animate-in fade-in-50">
                                    {/* Full Address */}
                                    {household.address && (
                                        <div className="text-xs text-gray-700 dark:text-gray-300">
                                            <p className="font-medium mb-1 text-gray-600 dark:text-gray-400">Full Address:</p>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                {household.address}
                                            </p>
                                        </div>
                                    )}

                                    {/* Contact Person */}
                                    {household.contact_person && (
                                        <div className="flex items-center gap-1.5 text-xs">
                                            <User className="h-3 w-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                            <span className="text-gray-600 dark:text-gray-400">Contact Person:</span>
                                            <span className="text-gray-900 dark:text-white">{household.contact_person}</span>
                                        </div>
                                    )}

                                    {/* Additional contact info */}
                                    {household.contact_number && (
                                        <div className="flex items-center gap-1.5 text-xs">
                                            <Phone className="h-3 w-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                            <span className="text-gray-600 dark:text-gray-400">Contact:</span>
                                            <span className="text-gray-900 dark:text-white">{formatContactNumber(household.contact_number)}</span>
                                        </div>
                                    )}

                                    {/* Dates */}
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div>
                                            <span className="text-gray-600 dark:text-gray-400">Created:</span>
                                            <span className="text-gray-900 dark:text-white ml-1">{formatDate(household.created_at)}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 dark:text-gray-400">Updated:</span>
                                            <span className="text-gray-900 dark:text-white ml-1">{formatDate(household.updated_at)}</span>
                                        </div>
                                    </div>

                                    {/* Collapse button */}
                                    <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                                        <Button
                                            variant="link"
                                            size="sm"
                                            className="h-6 p-0 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                                            onClick={(e) => handleViewDetails(household.id, e)}
                                        >
                                            <ExternalLink className="h-3 w-3 mr-1" />
                                            View full details
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 p-0 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                                            onClick={(e) => toggleCardExpansion(household.id, e)}
                                        >
                                            <ChevronUp className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>

                        {/* Footer Actions */}
                        <CardFooter className={`px-3 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 ${isCompactView ? 'py-1.5' : ''}`}>
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-0.5">
                                    {/* View Details */}
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={`${isCompactView ? 'h-6 w-6 p-0' : 'h-7 w-7 p-0'} text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700`}
                                                onClick={(e) => handleViewDetails(household.id, e)}
                                            >
                                                <Eye className={`${isCompactView ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200 border-gray-200 dark:border-gray-700">
                                            <p className="text-xs">View Details</p>
                                        </TooltipContent>
                                    </Tooltip>

                                    {/* Edit */}
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={`${isCompactView ? 'h-6 w-6 p-0' : 'h-7 w-7 p-0'} text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700`}
                                                onClick={(e) => handleEdit(household.id, e)}
                                            >
                                                <Edit className={`${isCompactView ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200 border-gray-200 dark:border-gray-700">
                                            <p className="text-xs">Edit</p>
                                        </TooltipContent>
                                    </Tooltip>

                                    {/* Copy Household Number */}
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={`${isCompactView ? 'h-6 w-6 p-0' : 'h-7 w-7 p-0'} text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onCopyToClipboard(household.household_number, 'Household Number');
                                                }}
                                            >
                                                <Copy className={`${isCompactView ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200 border-gray-200 dark:border-gray-700">
                                            <p className="text-xs">Copy Number</p>
                                        </TooltipContent>
                                    </Tooltip>

                                    {/* Copy Contact if available */}
                                    {household.contact_number && (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className={`${isCompactView ? 'h-6 w-6 p-0' : 'h-7 w-7 p-0'} text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onCopyToClipboard(household.contact_number, 'Contact Number');
                                                    }}
                                                >
                                                    <Clipboard className={`${isCompactView ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200 border-gray-200 dark:border-gray-700">
                                                <p className="text-xs">Copy Contact</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    )}
                                </div>

                                {/* Delete button */}
                                {household.status !== 'inactive' && (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={`${isCompactView ? 'h-6 w-6 p-0' : 'h-7 w-7 p-0'} text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDelete(household);
                                                }}
                                            >
                                                <Trash2 className={`${isCompactView ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200 border-gray-200 dark:border-gray-700">
                                            <p className="text-xs">Delete</p>
                                        </TooltipContent>
                                    </Tooltip>
                                )}
                            </div>
                        </CardFooter>
                    </Card>
                );
            })}
        </GridLayout>
    );
}