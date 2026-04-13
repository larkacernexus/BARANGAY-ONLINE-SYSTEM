// components/admin/residents/ResidentsGridView.tsx
import React, { useCallback, useMemo, memo, useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { GridLayout } from '@/components/adminui/grid-layout';
import { EmptyState } from '@/components/adminui/empty-state';
import { PhotoViewModal } from './photo-view-modal';
import { Link, router } from '@inertiajs/react';
import {
  Eye,
  Edit,
  Trash2,
  Clipboard,
  MoreVertical,
  Camera,
  Crown,
  Home,
  Phone,
  MapPin,
  QrCode,
  FileText,
  Heart,
  Mail,
  UserCheck,
  UserX,
  Users,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  User as UserIcon,
  Calendar,
  CheckSquare,
  Square,
} from 'lucide-react';
import { Resident } from '@/types/admin/residents/residents-types';
import { 
    extractResidentDisplayData, 
    getTruncationLengths,
    safeFormatContactNumber,
    formatDate 
} from '@/admin-utils/residentsDisplayUtils';
import { usePhotoModal } from '@/hooks/admin/usePhotoModal';
import { truncateText, truncateAddress, getPhotoUrl } from '@/admin-utils/residentsUtils';

interface ResidentsGridViewProps {
    residents: Resident[];
    isBulkMode: boolean;
    selectedResidents: number[];
    isMobile?: boolean;
    onItemSelect: (id: number) => void;
    hasActiveFilters: boolean;
    onClearFilters: () => void;
    onDelete: (resident: Resident) => void;
    onViewPhoto?: (resident: Resident) => void;
    onCopyToClipboard?: (text: string, label: string) => void;
    onGenerateId?: (resident: Resident) => void;
    onCreateClearance?: (resident: Resident) => void;
    onToggleStatus?: (resident: Resident) => void;
    windowWidth?: number;
}

// Shared Resident Card Component
const ResidentCard = memo(({ 
    resident, 
    isBulkMode, 
    isSelected, 
    isExpanded,
    onItemSelect,
    onDelete,
    onViewPhoto,
    onCopyToClipboard,
    onGenerateId,
    onCreateClearance,
    onToggleStatus,
    onToggleExpand,
    onViewDetails,
    onEdit,
    isMobile = false
}: {
    resident: Resident;
    isBulkMode: boolean;
    isSelected: boolean;
    isExpanded: boolean;
    onItemSelect: (id: number) => void;
    onDelete: (resident: Resident) => void;
    onViewPhoto?: (resident: Resident) => void;
    onCopyToClipboard?: (text: string, label: string) => void;
    onGenerateId?: (resident: Resident) => void;
    onCreateClearance?: (resident: Resident) => void;
    onToggleStatus?: (resident: Resident) => void;
    onToggleExpand: (id: number, e: React.MouseEvent) => void;
    onViewDetails: (id: number, e: React.MouseEvent) => void;
    onEdit: (id: number, e: React.MouseEvent) => void;
    isMobile?: boolean;
}) => {
    // Extract all display data using the centralized utility
    const displayData = extractResidentDisplayData(resident);
    const truncation = getTruncationLengths(isMobile || false);
    
    const {
        photoUrl,
        fullName,
        initials,
        age,
        householdInfo,
        isHead,
        hasPhoto,
        address,
        contactNumber,
        birthDate,
        email,
        civilStatus,
        gender,
        bloodType,
        occupation,
        educationalAttainment,
        notes,
        isVoter,
        purokName,
        documentsCount,
        statusConfig,
        civilStatusConfig
    } = displayData;
    
    // Memoized handlers
    const handleCardClick = useCallback((e: React.MouseEvent) => {
        if (isBulkMode) return;
        onToggleExpand(resident.id, e);
    }, [isBulkMode, resident.id, onToggleExpand]);

    const handleAvatarClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        if (onViewPhoto) {
            onViewPhoto(resident);
        }
    }, [onViewPhoto, resident]);

    const handleCopyName = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onCopyToClipboard?.(fullName, 'Name');
    }, [onCopyToClipboard, fullName]);

    const handleCopyContact = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        if (contactNumber) {
            onCopyToClipboard?.(contactNumber, 'Contact');
        }
    }, [onCopyToClipboard, contactNumber]);

    const handleCall = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        if (contactNumber) {
            window.location.href = `tel:${contactNumber}`;
        }
    }, [contactNumber]);

    const handleGenerateIdClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onGenerateId?.(resident);
    }, [onGenerateId, resident]);

    const handleCreateClearance = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onCreateClearance?.(resident);
    }, [onCreateClearance, resident]);

    const handleToggleStatus = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onToggleStatus?.(resident);
    }, [onToggleStatus, resident]);

    const handleDelete = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete(resident);
    }, [onDelete, resident]);

    return (
        <Card 
            className={`overflow-hidden border relative transition-all duration-200 bg-white dark:bg-gray-900 ${
                isSelected 
                    ? 'ring-2 ring-blue-500 border-blue-500 shadow-lg shadow-blue-500/20 dark:ring-blue-400 dark:border-blue-400' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg'
            } ${isExpanded ? 'shadow-lg' : ''} cursor-pointer group`}
            onClick={handleCardClick}
        >
            <CardContent className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        <Avatar 
                            className={`h-10 w-10 border-2 ${
                                isSelected ? 'border-blue-500' : 'border-gray-200 dark:border-gray-700'
                            } hover:opacity-80 transition-opacity flex-shrink-0 cursor-pointer`}
                            onClick={handleAvatarClick}
                        >
                            <AvatarImage src={photoUrl || ''} alt={fullName} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 text-blue-800 dark:text-blue-300 text-sm font-medium">
                                {initials || '?'}
                            </AvatarFallback>
                        </Avatar>
                        
                        <div className="min-w-0 flex-1">
                            <div className="font-medium text-gray-900 dark:text-white truncate flex items-center gap-1.5">
                                <span className="truncate">{truncateText(fullName, truncation.nameLength)}</span>
                                {isHead && (
                                    <Crown className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                                )}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                ID: {resident.id}
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-1 ml-2">
                        {isBulkMode && (
                            <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => onItemSelect(resident.id)}
                                onClick={(e) => e.stopPropagation()}
                                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                            />
                        )}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <MoreVertical className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={(e) => onViewDetails(resident.id, e)}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                </DropdownMenuItem>
                                
                                <DropdownMenuItem onClick={(e) => onEdit(resident.id, e)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Profile
                                </DropdownMenuItem>

                                {hasPhoto && onViewPhoto && (
                                    <DropdownMenuItem onClick={(e) => {
                                        e.stopPropagation();
                                        onViewPhoto(resident);
                                    }}>
                                        <Camera className="h-4 w-4 mr-2" />
                                        View Photo
                                    </DropdownMenuItem>
                                )}
                                
                                {onToggleStatus && (
                                    <DropdownMenuItem onClick={handleToggleStatus}>
                                        {resident.status === 'active' ? (
                                            <>
                                                <UserX className="h-4 w-4 mr-2" />
                                                Deactivate
                                            </>
                                        ) : (
                                            <>
                                                <UserCheck className="h-4 w-4 mr-2" />
                                                Activate
                                            </>
                                        )}
                                    </DropdownMenuItem>
                                )}
                                
                                <DropdownMenuSeparator />
                                
                                <DropdownMenuItem onClick={handleCopyName}>
                                    <Clipboard className="h-4 w-4 mr-2" />
                                    Copy Name
                                </DropdownMenuItem>
                                
                                {contactNumber && (
                                    <>
                                        <DropdownMenuItem onClick={handleCall}>
                                            <Phone className="h-4 w-4 mr-2" />
                                            Call Resident
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={handleCopyContact}>
                                            <Clipboard className="h-4 w-4 mr-2" />
                                            Copy Contact
                                        </DropdownMenuItem>
                                    </>
                                )}
                                
                                {onGenerateId && (
                                    <DropdownMenuItem onClick={handleGenerateIdClick}>
                                        <QrCode className="h-4 w-4 mr-2" />
                                        Generate ID
                                    </DropdownMenuItem>
                                )}
                                
                                {onCreateClearance && (
                                    <DropdownMenuItem onClick={handleCreateClearance}>
                                        <FileText className="h-4 w-4 mr-2" />
                                        Create Clearance
                                    </DropdownMenuItem>
                                )}

                                {isBulkMode && (
                                    <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={(e) => {
                                            e.stopPropagation();
                                            onItemSelect(resident.id);
                                        }}>
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
                                
                                <DropdownMenuSeparator />
                                
                                <DropdownMenuItem onClick={handleDelete} className="text-red-600 dark:text-red-400">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Resident
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Status Badges */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                    <Badge 
                        variant="outline" 
                        className={`text-xs px-2 py-0.5 ${statusConfig.color}`}
                    >
                        {statusConfig.label}
                    </Badge>
                    
                    {civilStatus && (
                        <Badge 
                            variant="outline" 
                            className={`text-xs px-2 py-0.5 ${civilStatusConfig.color}`}
                        >
                            <Heart className="h-3 w-3 mr-1" />
                            {civilStatusConfig.label}
                        </Badge>
                    )}
                    
                    {isHead && (
                        <Badge variant="outline" className="text-xs px-2 py-0.5 bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                            <Crown className="h-3 w-3 mr-1" />
                            Head
                        </Badge>
                    )}
                </div>

                {/* Always visible info */}
                <div className="space-y-2 mb-2">
                    <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                        <span>
                            {age !== null ? `${age} years` : 'Age N/A'} • {gender || 'Gender N/A'}
                        </span>
                    </div>

                    {address && (
                        <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                            <span 
                                className="truncate"
                                title={address}
                            >
                                {truncateAddress(address, truncation.addressLength)}
                            </span>
                        </div>
                    )}

                    {purokName && (
                        <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                            <Home className="h-3.5 w-3.5 flex-shrink-0" />
                            <span className="truncate">{purokName}</span>
                        </div>
                    )}

                    {contactNumber && (
                        <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                            <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                            <span>{safeFormatContactNumber(contactNumber)}</span>
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
                            onClick={(e) => onToggleExpand(resident.id, e)}
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
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-2 space-y-3 animate-in fade-in-50 duration-200">
                        {householdInfo && (
                            <div className="flex items-start gap-2 text-sm">
                                <Users className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
                                <div className="min-w-0 flex-1">
                                    <Link 
                                        href={`/admin/households/${householdInfo.id}`}
                                        className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 block"
                                        title={householdInfo.name}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {truncateText(householdInfo.name, truncation.householdNameLength)}
                                    </Link>
                                    {isHead && (
                                        <span className="text-xs text-amber-600 dark:text-amber-400">
                                            Head of Household
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        {email && (
                            <div className="flex items-center gap-2 text-sm">
                                <Mail className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                <span className="text-gray-700 dark:text-gray-300 truncate">
                                    {email}
                                </span>
                            </div>
                        )}

                        {birthDate && (
                            <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                <span className="text-gray-700 dark:text-gray-300">
                                    Born: {formatDate(birthDate)}
                                </span>
                            </div>
                        )}

                        {bloodType && (
                            <div className="flex items-center gap-2 text-sm">
                                <Heart className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                <span className="text-gray-700 dark:text-gray-300">
                                    Blood Type: {bloodType}
                                </span>
                            </div>
                        )}

                        {(occupation || educationalAttainment) && (
                            <div className="space-y-1.5">
                                {occupation && (
                                    <div className="text-sm">
                                        <span className="text-gray-500 dark:text-gray-400">Occupation: </span>
                                        <span className="text-gray-700 dark:text-gray-300">{occupation}</span>
                                    </div>
                                )}
                                {educationalAttainment && (
                                    <div className="text-sm">
                                        <span className="text-gray-500 dark:text-gray-400">Education: </span>
                                        <span className="text-gray-700 dark:text-gray-300">{educationalAttainment}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {isVoter !== undefined && (
                            <div className="flex items-center gap-2 text-sm">
                                {isVoter ? (
                                    <>
                                        <UserCheck className="h-4 w-4 text-green-500 dark:text-green-400" />
                                        <span className="text-green-700 dark:text-green-400">Registered Voter</span>
                                    </>
                                ) : (
                                    <>
                                        <UserX className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                        <span className="text-gray-600 dark:text-gray-400">Not a Voter</span>
                                    </>
                                )}
                            </div>
                        )}

                        {notes && (
                            <div className="text-sm">
                                <p className="text-gray-500 dark:text-gray-400 mb-1">Notes:</p>
                                <p className="text-gray-700 dark:text-gray-300 line-clamp-2 italic">
                                    "{truncateText(notes, 100)}"
                                </p>
                            </div>
                        )}

                        {documentsCount > 0 && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <FileText className="h-4 w-4" />
                                <span>{documentsCount} document(s)</span>
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                            <button
                                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1.5 transition-colors"
                                onClick={(e) => onViewDetails(resident.id, e)}
                            >
                                <ExternalLink className="h-3.5 w-3.5" />
                                View full profile
                            </button>
                            <button
                                className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                onClick={(e) => onToggleExpand(resident.id, e)}
                            >
                                <ChevronUp className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
});

ResidentCard.displayName = 'ResidentCard';

// Empty State Component
const EmptyStateComponent = ({ hasActiveFilters, onClearFilters }: { hasActiveFilters: boolean; onClearFilters: () => void }) => (
    <EmptyState
        title="No residents found"
        description={hasActiveFilters 
            ? 'Try changing your filters or search criteria.'
            : 'Get started by adding a resident.'}
        icon={<UserIcon className="h-12 w-12 text-gray-300 dark:text-gray-700" />}
        hasFilters={hasActiveFilters}
        onClearFilters={onClearFilters}
        onCreateNew={() => router.get('/admin/residents/create')}
        createLabel="Add Resident"
    />
);

// Main Grid View Component
export default function ResidentsGridView({
    residents,
    isBulkMode,
    selectedResidents,
    isMobile = false,
    onItemSelect,
    hasActiveFilters,
    onClearFilters,
    onDelete,
    onViewPhoto,
    onCopyToClipboard = (text, label) => {
        navigator.clipboard.writeText(text).catch(() => {
            console.error(`Failed to copy ${label} to clipboard`);
        });
    },
    onGenerateId,
    onCreateClearance,
    onToggleStatus,
    windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1024
}: ResidentsGridViewProps) {
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [devicePixelRatio, setDevicePixelRatio] = useState(1);
    const { isOpen, selectedResident, openModal, closeModal } = usePhotoModal();
    
    useEffect(() => {
        setDevicePixelRatio(window.devicePixelRatio || 1);
    }, []);
    
    // Determine grid columns based on actual available width and scaling
    const gridCols = useMemo(() => {
        if (windowWidth < 640) return 1;  // Mobile: 1 column
        if (windowWidth < 900) return 2;   // Small tablets: 2 columns
        if (windowWidth < 1280) return 3;  // Laptops/tablets landscape: 3 columns
        if (windowWidth < 1600) return 3;  // Standard laptops with scaling: 3 columns
        return 4;                           // Large desktop displays: 4 columns
    }, [windowWidth, devicePixelRatio]);
    
    // Memoized handlers
    const handleToggleExpand = useCallback((id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedId(prev => prev === id ? null : id);
    }, []);

    const handleViewDetails = useCallback((id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        router.get(`/admin/residents/${id}`);
    }, []);

    const handleEdit = useCallback((id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        router.get(`/admin/residents/${id}/edit`);
    }, []);

    // Memoize selected set for quick lookup
    const selectedSet = useMemo(() => new Set(selectedResidents), [selectedResidents]);

    // Early return for empty state
    if (residents.length === 0) {
        return <EmptyStateComponent hasActiveFilters={hasActiveFilters} onClearFilters={onClearFilters} />;
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
                {residents.map((resident) => (
                    <ResidentCard
                        key={resident.id}
                        resident={resident}
                        isBulkMode={isBulkMode}
                        isSelected={selectedSet.has(resident.id)}
                        isExpanded={expandedId === resident.id}
                        onItemSelect={onItemSelect}
                        onDelete={onDelete}
                        onViewPhoto={onViewPhoto || openModal}
                        onCopyToClipboard={onCopyToClipboard}
                        onGenerateId={onGenerateId}
                        onCreateClearance={onCreateClearance}
                        onToggleStatus={onToggleStatus}
                        onToggleExpand={handleToggleExpand}
                        onViewDetails={handleViewDetails}
                        onEdit={handleEdit}
                        isMobile={isMobile}
                    />
                ))}
            </GridLayout>

            {/* Photo Modal */}
            <PhotoViewModal
                isOpen={isOpen}
                onClose={closeModal}
                resident={selectedResident}
                photoUrl={selectedResident ? getPhotoUrl(selectedResident.profile_photo, (selectedResident as any).photo_url) : null}
            />
        </>
    );
}