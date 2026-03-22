import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { EmptyState } from '@/components/adminui/empty-state';
import { GridLayout } from '@/components/adminui/grid-layout';
import { Home, Users, Phone, Eye, Edit, Trash2, Clipboard, MapPin, ChevronDown, ChevronUp, ExternalLink, Copy, User, Calendar, Map as MapIcon, MoreVertical, Square, CheckSquare, QrCode, FileText } from 'lucide-react';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import { getPurokName, getStatusBadgeVariant, truncateText, truncateAddress, formatContactNumber } from '../../../admin-utils/householdUtils';
import { SingleHouseholdMapModal } from '@/components/admin/puroks/show/components/SingleHouseholdMapModal';

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
    onGenerateQr?: (household: any) => void;
    onCreateClearance?: (household: any) => void;
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
    puroks,
    onGenerateQr,
    onCreateClearance
}: HouseholdsGridViewProps) {
    const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
    const [mapModalOpen, setMapModalOpen] = useState(false);
    const [selectedHouseholdForMap, setSelectedHouseholdForMap] = useState<any>(null);
    
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
        router.get(`/admin/households/${householdId}`);
    };

    // Handle edit
    const handleEdit = (householdId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        router.get(`/admin/households/${householdId}/edit`);
    };

    // Handle map view
    const handleViewMap = (household: any, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedHouseholdForMap(household);
        setMapModalOpen(true);
    };

    // Handle generate QR
    const handleGenerateQr = (household: any, e: React.MouseEvent) => {
        e.stopPropagation();
        if (onGenerateQr) {
            onGenerateQr(household);
        } else {
            router.get(`/admin/households/${household.id}/generate-qr`);
        }
    };

    // Handle create clearance
    const handleCreateClearance = (household: any, e: React.MouseEvent) => {
        e.stopPropagation();
        if (onCreateClearance) {
            onCreateClearance(household);
        } else {
            router.get(`/admin/households/${household.id}/clearance/create`);
        }
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
        <>
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
                    const hasCoordinates = household.latitude && household.longitude;
                    
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
                            <CardContent className="p-4">
                                {/* Header with Checkbox and DropdownMenu */}
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        {/* Icon */}
                                        <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex-shrink-0">
                                            <Home className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        
                                        <div className="min-w-0 flex-1">
                                            <div className="font-medium text-gray-900 dark:text-white truncate flex items-center gap-1">
                                                {truncateText(household.head_of_family, nameLength)}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                #{household.household_number}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-1">
                                        {isBulkMode && (
                                            <Checkbox
                                                checked={isSelected}
                                                onCheckedChange={() => onItemSelect(household.id)}
                                                onClick={(e) => e.stopPropagation()}
                                                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 border-gray-300 dark:border-gray-600"
                                            />
                                        )}
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button
                                                    className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <MoreVertical className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48">
                                                <DropdownMenuItem 
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleViewDetails(household.id, e);
                                                    }}
                                                    className="flex items-center gap-2 cursor-pointer"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    <span>View Details</span>
                                                </DropdownMenuItem>
                                                
                                                <DropdownMenuItem 
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleEdit(household.id, e);
                                                    }}
                                                    className="flex items-center gap-2 cursor-pointer"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                    <span>Edit Household</span>
                                                </DropdownMenuItem>

                                                {hasCoordinates && (
                                                    <DropdownMenuItem 
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            handleViewMap(household, e);
                                                        }}
                                                        className="flex items-center gap-2 cursor-pointer"
                                                    >
                                                        <MapIcon className="h-4 w-4" />
                                                        <span>View on Map</span>
                                                    </DropdownMenuItem>
                                                )}
                                                
                                                <DropdownMenuSeparator />
                                                
                                                <DropdownMenuItem 
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        onCopyToClipboard(household.household_number, 'Household Number');
                                                    }}
                                                    className="flex items-center gap-2 cursor-pointer"
                                                >
                                                    <Clipboard className="h-4 w-4" />
                                                    <span>Copy Household No.</span>
                                                </DropdownMenuItem>
                                                
                                                {household.contact_number && (
                                                    <>
                                                        <DropdownMenuItem 
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                window.location.href = `tel:${household.contact_number}`;
                                                            }}
                                                            className="flex items-center gap-2 cursor-pointer"
                                                        >
                                                            <Phone className="h-4 w-4" />
                                                            <span>Call Household</span>
                                                        </DropdownMenuItem>
                                                        
                                                        <DropdownMenuItem 
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                onCopyToClipboard(household.contact_number, 'Contact');
                                                            }}
                                                            className="flex items-center gap-2 cursor-pointer"
                                                        >
                                                            <Clipboard className="h-4 w-4" />
                                                            <span>Copy Contact</span>
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                                
                                                {onGenerateQr && (
                                                    <DropdownMenuItem 
                                                        onClick={(e) => handleGenerateQr(household, e)}
                                                        className="flex items-center gap-2 cursor-pointer"
                                                    >
                                                        <QrCode className="h-4 w-4" />
                                                        <span>Generate QR Code</span>
                                                    </DropdownMenuItem>
                                                )}
                                                
                                                {onCreateClearance && (
                                                    <DropdownMenuItem 
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            handleCreateClearance(household, e);
                                                        }}
                                                        className="flex items-center gap-2 cursor-pointer"
                                                    >
                                                        <FileText className="h-4 w-4" />
                                                        <span>Create Clearance</span>
                                                    </DropdownMenuItem>
                                                )}

                                                {isBulkMode && (
                                                    <>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem 
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                onItemSelect(household.id);
                                                            }}
                                                            className="flex items-center gap-2 cursor-pointer"
                                                        >
                                                            {isSelected ? (
                                                                <>
                                                                    <CheckSquare className="h-4 w-4 text-green-600" />
                                                                    <span className="text-green-600">Deselect</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Square className="h-4 w-4" />
                                                                    <span>Select for Bulk</span>
                                                                </>
                                                            )}
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                                
                                                {household.status !== 'inactive' && (
                                                    <>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem 
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                onDelete(household);
                                                            }}
                                                            className="flex items-center gap-2 cursor-pointer text-red-600 dark:text-red-400 focus:text-red-700 dark:focus:text-red-300 focus:bg-red-50 dark:focus:bg-red-950/30"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                            <span>Delete Household</span>
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>

                                {/* Status Badges */}
                                <div className="flex flex-wrap gap-1.5 mb-3">
                                    <Badge 
                                        variant="outline" 
                                        className={`text-xs px-2 py-0.5 border ${getStatusColor(household.status)}`}
                                    >
                                        {household.status}
                                    </Badge>
                                    
                                    <Badge variant="outline" className="text-xs px-2 py-0.5">
                                        <Users className="h-3 w-3 mr-1" />
                                        {household.member_count || 0} members
                                    </Badge>
                                </div>

                                {/* Always visible info */}
                                <div className="space-y-2 mb-2">
                                    {/* Address */}
                                    {household.address && (
                                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                                            <span 
                                                className="truncate"
                                                title={household.address}
                                            >
                                                {truncateAddress(household.address, addressLength)}
                                            </span>
                                        </div>
                                    )}

                                    {/* Purok */}
                                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                        <Home className="h-3.5 w-3.5 flex-shrink-0" />
                                        <span>{getPurokName(household, puroks)}</span>
                                    </div>

                                    {/* Contact Number */}
                                    {household.contact_number && (
                                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                            <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                                            <span>{formatContactNumber(household.contact_number)}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Expand/Collapse indicator */}
                                {!isBulkMode && !isExpanded && (
                                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            Click to view details
                                        </div>
                                        <button
                                            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                            onClick={(e) => toggleCardExpansion(household.id, e)}
                                        >
                                            <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                        </button>
                                    </div>
                                )}

                                {/* Expanded Details */}
                                {isExpanded && (
                                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-2 space-y-3 animate-in fade-in-50">
                                        {/* Full Address */}
                                        {household.address && (
                                            <div className="text-sm">
                                                <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Full Address:</p>
                                                <p className="text-gray-600 dark:text-gray-400">
                                                    {household.address}
                                                </p>
                                            </div>
                                        )}

                                        {/* Contact Person */}
                                        {household.contact_person && (
                                            <div className="flex items-center gap-1 text-sm">
                                                <User className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                                <span className="text-gray-600 dark:text-gray-400">Contact Person:</span>
                                                <span className="text-gray-900 dark:text-white ml-1">{household.contact_person}</span>
                                            </div>
                                        )}

                                        {/* Map Coordinates (if available) */}
                                        {hasCoordinates && (
                                            <div className="flex items-start gap-1 text-sm">
                                                <MapIcon className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
                                                <div className="flex-1">
                                                    <span className="text-gray-600 dark:text-gray-400">Coordinates:</span>
                                                    <div className="text-gray-900 dark:text-white mt-0.5">
                                                        <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                                                            {household.latitude?.toFixed(6)}, {household.longitude?.toFixed(6)}
                                                        </code>
                                                        <Button
                                                            variant="link"
                                                            size="sm"
                                                            className="h-auto p-0 ml-2 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                                                            onClick={(e) => handleViewMap(household, e)}
                                                        >
                                                            View on map
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Dates */}
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div>
                                                <span className="text-gray-500 dark:text-gray-400">Created:</span>
                                                <span className="text-gray-700 dark:text-gray-300 ml-1">{formatDate(household.created_at)}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500 dark:text-gray-400">Updated:</span>
                                                <span className="text-gray-700 dark:text-gray-300 ml-1">{formatDate(household.updated_at)}</span>
                                            </div>
                                        </div>

                                        {/* View full details link and collapse button */}
                                        <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                                            <button
                                                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
                                                onClick={(e) => handleViewDetails(household.id, e)}
                                            >
                                                <ExternalLink className="h-3.5 w-3.5" />
                                                View full details
                                            </button>
                                            <button
                                                className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                                onClick={(e) => toggleCardExpansion(household.id, e)}
                                            >
                                                <ChevronUp className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </GridLayout>

            {/* Map Modal */}
            {selectedHouseholdForMap && (
                <SingleHouseholdMapModal
                    open={mapModalOpen}
                    onOpenChange={setMapModalOpen}
                    household={selectedHouseholdForMap}
                    purokName={getPurokName(selectedHouseholdForMap, puroks)}
                />
            )}
        </>
    );
}