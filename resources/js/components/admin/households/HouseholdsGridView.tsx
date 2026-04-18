// components/admin/households/HouseholdsGridView.tsx

import { Card, CardContent } from '@/components/ui/card';
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
import { EmptyState } from '@/components/adminui/empty-state';
import { GridLayout } from '@/components/adminui/grid-layout';
import { 
  Home, 
  Users, 
  Phone, 
  Eye, 
  Edit, 
  Trash2, 
  Clipboard, 
  MapPin, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink, 
  Copy, 
  User, 
  Calendar, 
  Map as MapIcon, 
  MoreVertical, 
  Square, 
  CheckSquare, 
  QrCode, 
  FileText, 
  PlayCircle, 
  PauseCircle 
} from 'lucide-react';
import { router } from '@inertiajs/react';
import { useState, useMemo, useCallback } from 'react';
import { getPurokName, truncateText, truncateAddress, formatContactNumber } from '../../../admin-utils/householdUtils';
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
    onToggleStatus?: (household: any) => void;
    onCopyToClipboard: (text: string, label: string) => void;
    puroks: any[];
    onGenerateQr?: (household: any) => void;
    onCreateClearance?: (household: any) => void;
    windowWidth?: number;
    isLoading?: boolean;
}

// Status color classes
const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
        case 'active':
            return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
        case 'inactive':
            return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
        case 'archived':
            return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
    }
};

const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch {
        return 'Invalid date';
    }
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
    onToggleStatus,
    onCopyToClipboard,
    puroks,
    onGenerateQr,
    onCreateClearance,
    windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1024,
    isLoading = false
}: HouseholdsGridViewProps) {
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [mapModalOpen, setMapModalOpen] = useState(false);
    const [selectedHouseholdForMap, setSelectedHouseholdForMap] = useState<any>(null);
    
    const isCompactView = isMobile;
    
    // Determine grid columns based on actual available width
    const gridCols = useMemo(() => {
        const effectiveWidth = windowWidth;
        
        if (effectiveWidth < 640) return 1;      // Mobile: 1 column
        if (effectiveWidth < 1024) return 2;     // Tablet: 2 columns
        if (effectiveWidth < 1500) return 3;     // Laptop (with scaling): 3 columns
        return 4;                                 // Wide desktop: 4 columns
    }, [windowWidth]);

    // Toggle card expansion
    const handleToggleExpand = useCallback((id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (isLoading) return;
        setExpandedId(prev => prev === id ? null : id);
    }, [isLoading]);

    // Handle card click
    const handleCardClick = (householdId: number, e: React.MouseEvent) => {
        if (isBulkMode || isLoading) {
            e.stopPropagation();
            return;
        }
        e.stopPropagation();
        setExpandedId(prev => prev === householdId ? null : householdId);
    };

    // Handle view details
    const handleViewDetails = (householdId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (isLoading) return;
        router.get(`/admin/households/${householdId}`);
    };

    // Handle edit
    const handleEdit = (householdId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (isLoading) return;
        router.get(`/admin/households/${householdId}/edit`);
    };

    // Handle toggle status
    const handleToggleStatus = (household: any, e: React.MouseEvent) => {
        e.stopPropagation();
        if (isLoading) return;
        if (onToggleStatus) {
            onToggleStatus(household);
        }
    };

    // Handle map view
    const handleViewMap = (household: any, e: React.MouseEvent) => {
        e.stopPropagation();
        if (isLoading) return;
        setSelectedHouseholdForMap(household);
        setMapModalOpen(true);
    };

    // Handle generate QR
    const handleGenerateQr = (household: any, e: React.MouseEvent) => {
        e.stopPropagation();
        if (isLoading) return;
        if (onGenerateQr) {
            onGenerateQr(household);
        } else {
            router.get(`/admin/households/${household.id}/generate-qr`);
        }
    };

    // Handle create clearance
    const handleCreateClearance = (household: any, e: React.MouseEvent) => {
        e.stopPropagation();
        if (isLoading) return;
        if (onCreateClearance) {
            onCreateClearance(household);
        } else {
            router.get(`/admin/households/${household.id}/clearance/create`);
        }
    };
    
    // Check if household can be deleted
    const canDelete = (status: string) => {
        return status === 'pending' || status === 'inactive';
    };
    
    // Memoize selected set for quick lookup
    const selectedSet = useMemo(() => new Set(selectedHouseholds), [selectedHouseholds]);

    // Empty state
    if (households.length === 0) {
        return (
            <EmptyState
                title="No households found"
                description={hasActiveFilters 
                    ? 'Try changing your filters or search criteria.'
                    : 'Get started by registering a household.'}
                icon={<Home className="h-12 w-12 text-gray-300 dark:text-gray-700" />}
                action={hasActiveFilters ? {
                    label: "Clear Filters",
                    onClick: onClearFilters
                } : undefined}
            />
        );
    }

    return (
        <>
            <GridLayout
                isEmpty={false}
                emptyState={null}
                gridCols={{ base: 1, sm: 2, lg: 3, xl: gridCols as 1 | 2 | 3 | 4 }}
                gap={{ base: '3', sm: '4' }}
                padding="p-4"
            >
                {households.map(household => {
                    const isSelected = selectedSet.has(household.id);
                    const isExpanded = expandedId === household.id;
                    const hasCoordinates = !!(household.latitude && household.longitude);
                    
                    // Truncation lengths based on view
                    const nameLength = isCompactView ? 20 : 30;
                    const addressLength = isCompactView ? 25 : 40;
                    
                    return (
                        <Card 
                            key={household.id}
                            className={`overflow-hidden border relative transition-all duration-200 bg-white dark:bg-gray-900 ${
                                isSelected 
                                    ? 'ring-2 ring-blue-500 border-blue-500 shadow-lg shadow-blue-500/20 dark:ring-blue-400 dark:border-blue-400' 
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg'
                            } ${isExpanded ? 'shadow-lg' : ''} ${
                                isLoading ? 'cursor-default opacity-60 pointer-events-none' : 'cursor-pointer'
                            }`}
                            onClick={(e) => handleCardClick(household.id, e)}
                        >
                            <CardContent className="p-4">
                                {/* Header */}
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                            <Home className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        
                                        <div className="min-w-0 flex-1">
                                            <div className="font-medium text-gray-900 dark:text-white truncate">
                                                {truncateText(household.head_of_family, nameLength)}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                #{household.household_number}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-1 ml-2">
                                        {isBulkMode && (
                                            <Checkbox
                                                checked={isSelected}
                                                onCheckedChange={() => onItemSelect(household.id)}
                                                onClick={(e) => e.stopPropagation()}
                                                disabled={isLoading}
                                                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                            />
                                        )}
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button
                                                    className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                                    onClick={(e) => e.stopPropagation()}
                                                    disabled={isLoading}
                                                >
                                                    <MoreVertical className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48 dark:bg-gray-900 dark:border-gray-700">
                                                <DropdownMenuItem onClick={(e) => handleViewDetails(household.id, e)} className="cursor-pointer">
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    View Details
                                                </DropdownMenuItem>
                                                
                                                <DropdownMenuItem onClick={(e) => handleEdit(household.id, e)} className="cursor-pointer">
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Edit Household
                                                </DropdownMenuItem>

                                                {onToggleStatus && (
                                                    <>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={(e) => handleToggleStatus(household, e)} className="cursor-pointer">
                                                            {household.status === 'active' ? (
                                                                <>
                                                                    <PauseCircle className="h-4 w-4 mr-2" />
                                                                    Deactivate
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <PlayCircle className="h-4 w-4 mr-2" />
                                                                    Activate
                                                                </>
                                                            )}
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                                
                                                <DropdownMenuSeparator />

                                                {hasCoordinates && (
                                                    <DropdownMenuItem onClick={(e) => handleViewMap(household, e)} className="cursor-pointer">
                                                        <MapIcon className="h-4 w-4 mr-2" />
                                                        View on Map
                                                    </DropdownMenuItem>
                                                )}
                                                
                                                <DropdownMenuItem onClick={(e) => {
                                                    e.stopPropagation();
                                                    onCopyToClipboard(household.household_number, 'Household Number');
                                                }} className="cursor-pointer">
                                                    <Clipboard className="h-4 w-4 mr-2" />
                                                    Copy Household #
                                                </DropdownMenuItem>
                                                
                                                <DropdownMenuItem onClick={(e) => {
                                                    e.stopPropagation();
                                                    onCopyToClipboard(household.head_of_family, 'Head of Family');
                                                }} className="cursor-pointer">
                                                    <Clipboard className="h-4 w-4 mr-2" />
                                                    Copy Head Name
                                                </DropdownMenuItem>
                                                
                                                {household.address && (
                                                    <DropdownMenuItem onClick={(e) => {
                                                        e.stopPropagation();
                                                        onCopyToClipboard(household.address, 'Address');
                                                    }} className="cursor-pointer">
                                                        <Clipboard className="h-4 w-4 mr-2" />
                                                        Copy Address
                                                    </DropdownMenuItem>
                                                )}
                                                
                                                {household.contact_number && (
                                                    <>
                                                        <DropdownMenuItem onClick={(e) => {
                                                            e.stopPropagation();
                                                            window.location.href = `tel:${household.contact_number}`;
                                                        }} className="cursor-pointer">
                                                            <Phone className="h-4 w-4 mr-2" />
                                                            Call Household
                                                        </DropdownMenuItem>
                                                        
                                                        <DropdownMenuItem onClick={(e) => {
                                                            e.stopPropagation();
                                                            onCopyToClipboard(household.contact_number, 'Contact');
                                                        }} className="cursor-pointer">
                                                            <Copy className="h-4 w-4 mr-2" />
                                                            Copy Contact
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                                
                                                <DropdownMenuSeparator />
                                                
                                                <DropdownMenuItem onClick={(e) => handleGenerateQr(household, e)} className="cursor-pointer">
                                                    <QrCode className="h-4 w-4 mr-2" />
                                                    Generate QR Code
                                                </DropdownMenuItem>
                                                
                                                <DropdownMenuItem onClick={(e) => handleCreateClearance(household, e)} className="cursor-pointer">
                                                    <FileText className="h-4 w-4 mr-2" />
                                                    Create Clearance
                                                </DropdownMenuItem>

                                                {isBulkMode && (
                                                    <>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={(e) => {
                                                            e.stopPropagation();
                                                            onItemSelect(household.id);
                                                        }} className="cursor-pointer">
                                                            {isSelected ? (
                                                                <>
                                                                    <CheckSquare className="h-4 w-4 mr-2 text-green-600" />
                                                                    <span className="text-green-600">Deselect</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Square className="h-4 w-4 mr-2" />
                                                                    Select for Bulk
                                                                </>
                                                            )}
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                                
                                                {canDelete(household.status) && (
                                                    <>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onDelete(household);
                                                            }}
                                                            className="text-red-600 dark:text-red-400 cursor-pointer"
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            Delete Household
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
                                        className={`text-xs px-2 py-0.5 ${getStatusColor(household.status)}`}
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
                                        <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
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
                                    <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                                        <Home className="h-3.5 w-3.5 flex-shrink-0" />
                                        <span>{getPurokName(household, puroks)}</span>
                                    </div>

                                    {/* Contact Number */}
                                    {household.contact_number && (
                                        <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                                            <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                                            <span>{formatContactNumber(household.contact_number)}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Expand/Collapse indicator */}
                                {!isBulkMode && (
                                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {isExpanded ? 'Hide details' : 'Click to view details'}
                                        </div>
                                        <button
                                            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                            onClick={(e) => handleToggleExpand(household.id, e)}
                                            disabled={isLoading}
                                        >
                                            {isExpanded ? (
                                                <ChevronUp className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                            ) : (
                                                <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                            )}
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
                                            <div className="flex items-center gap-2 text-sm">
                                                <User className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                                <span className="text-gray-600 dark:text-gray-400">Contact Person:</span>
                                                <span className="text-gray-900 dark:text-white">{household.contact_person}</span>
                                            </div>
                                        )}

                                        {/* Map Coordinates */}
                                        {hasCoordinates && (
                                            <div className="text-sm">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <MapIcon className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                                    <span className="text-gray-600 dark:text-gray-400">Coordinates:</span>
                                                </div>
                                                <div className="pl-6">
                                                    <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                                                        {household.latitude?.toFixed(6)}, {household.longitude?.toFixed(6)}
                                                    </code>
                                                    <Button
                                                        variant="link"
                                                        size="sm"
                                                        className="h-auto p-0 ml-2 text-xs text-blue-600 dark:text-blue-400"
                                                        onClick={(e) => handleViewMap(household, e)}
                                                        disabled={isLoading}
                                                    >
                                                        View on map
                                                    </Button>
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

                                        {/* View full details link */}
                                        <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                                            <button
                                                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1.5"
                                                onClick={(e) => handleViewDetails(household.id, e)}
                                                disabled={isLoading}
                                            >
                                                <ExternalLink className="h-3.5 w-3.5" />
                                                View full details
                                            </button>
                                            <button
                                                className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                                onClick={(e) => handleToggleExpand(household.id, e)}
                                                disabled={isLoading}
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
                    onOpenChange={(open) => {
                        setMapModalOpen(open);
                        if (!open) setSelectedHouseholdForMap(null);
                    }}
                    household={selectedHouseholdForMap}
                    purokName={getPurokName(selectedHouseholdForMap, puroks)}
                />
            )}
        </>
    );
}