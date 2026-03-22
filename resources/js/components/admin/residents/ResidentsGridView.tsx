// @/components/admin/residents/residents-grid-view.tsx
import React, { useCallback, useMemo, useState } from 'react';
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
  Copy,
  Camera,
  Crown,
  Home,
  Phone,
  MapPin,
  QrCode,
  FileText,
  CheckSquare,
  Square,
  Calendar,
  Heart,
  Mail,
  UserCheck,
  UserX,
  Users,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  User as UserIcon
} from 'lucide-react';
import { Resident } from '@/types';
import {
    truncateText,
    truncateAddress,
    formatContactNumber,
    getPhotoUrl,
    getFullName,
    isHeadOfHousehold,
    getStatusBadgeVariant,
    getStatusLabel,
    getHouseholdInfo
} from '@/admin-utils/residentsUtils';

interface ResidentsGridViewProps {
    residents: Resident[];
    isBulkMode: boolean;
    selectedResidents: number[];
    isMobile: boolean;
    onItemSelect: (id: number) => void;
    hasActiveFilters: boolean;
    onClearFilters: () => void;
    onDelete: (resident: Resident) => void;
    onViewPhoto: (resident: Resident) => void;
    onCopyToClipboard?: (text: string, label: string) => void;
    onGenerateId?: (resident: Resident) => void;
    onCreateClearance?: (resident: Resident) => void;
}

// Helper function to get initials from name
const getInitials = (firstName: string | null | undefined, lastName: string | null | undefined): string => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return `${first}${last}`.toUpperCase() || '?';
};

// Helper function for formatting dates
const formatDate = (dateString?: string | null): string => {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch {
        return 'N/A';
    }
};

// Helper function for age calculation
const calculateAge = (birthDate?: string | null): number | null => {
    if (!birthDate) return null;
    try {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    } catch {
        return null;
    }
};

// Status color classes
const getStatusColor = (status: unknown): string => {
    const statusStr = typeof status === 'string' ? status.toLowerCase() : '';
    
    switch (statusStr) {
        case 'active':
            return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
        case 'inactive':
            return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
        case 'pending':
            return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
        case 'deceased':
            return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
    }
};

// Civil status color
const getCivilStatusColor = (status: unknown): string => {
    const statusStr = typeof status === 'string' ? status.toLowerCase() : '';
    
    switch (statusStr) {
        case 'married':
            return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
        case 'single':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
        case 'widowed':
            return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
        case 'divorced':
            return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
};

// Type guard for Purok object
const isPurokObject = (purok: unknown): purok is { id: number; name: string } => {
    return typeof purok === 'object' && purok !== null && 'name' in purok;
};

// Type guard for Document object
const isDocumentArray = (documents: unknown): documents is Array<{ id: number; name?: string }> => {
    return Array.isArray(documents);
};

export default function ResidentsGridView({
    residents,
    isBulkMode,
    selectedResidents,
    isMobile,
    onItemSelect,
    hasActiveFilters,
    onClearFilters,
    onDelete,
    onViewPhoto,
    onCopyToClipboard = (text, label) => {
        navigator.clipboard.writeText(text).then(() => {
            console.log(`${label} copied to clipboard`);
        }).catch(() => {
            console.error('Failed to copy to clipboard');
        });
    },
    onGenerateId,
    onCreateClearance
}: ResidentsGridViewProps) {
    
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [photoModalOpen, setPhotoModalOpen] = useState(false);
    const [selectedResidentForPhoto, setSelectedResidentForPhoto] = useState<Resident | null>(null);
    
    // Memoize the empty state to prevent unnecessary re-renders
    const emptyState = useMemo(() => (
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
    ), [hasActiveFilters, onClearFilters]);

    // Handle create new
    const handleCreateNew = useCallback(() => {
        router.get('/admin/residents/create');
    }, []);

    // Handle card click
    const handleCardClick = useCallback((id: number, e: React.MouseEvent) => {
        if (isBulkMode) {
            e.stopPropagation();
            return;
        }
        e.stopPropagation();
        setExpandedId(prev => prev === id ? null : id);
    }, [isBulkMode]);

    // Handle view details
    const handleViewDetails = useCallback((id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        router.get(`/admin/residents/${id}`);
    }, []);

    // Handle edit
    const handleEdit = useCallback((id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        router.get(`/admin/residents/${id}/edit`);
    }, []);

    // Handle generate ID
    const handleGenerateId = useCallback((resident: Resident, e: React.MouseEvent) => {
        e.stopPropagation();
        if (onGenerateId) {
            onGenerateId(resident);
        } else {
            router.get(`/admin/residents/${resident.id}/generate-id`);
        }
    }, [onGenerateId]);

    // Handle view photo
    const handleViewPhoto = useCallback((resident: Resident, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedResidentForPhoto(resident);
        setPhotoModalOpen(true);
    }, []);

    // Handle toggle expand
    const handleToggleExpand = useCallback((id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedId(prev => prev === id ? null : id);
    }, []);

    const handleClosePhotoModal = () => {
        setPhotoModalOpen(false);
        setSelectedResidentForPhoto(null);
    };

    // If there are no residents, show empty state
    if (residents.length === 0) {
        return (
            <EmptyState
                title="No residents found"
                description={hasActiveFilters 
                    ? 'Try changing your filters or search criteria.'
                    : 'Get started by adding a resident.'}
                icon={<UserIcon className="h-12 w-12 text-gray-300 dark:text-gray-700" />}
                hasFilters={hasActiveFilters}
                onClearFilters={onClearFilters}
                onCreateNew={handleCreateNew}
                createLabel="Add Resident"
            />
        );
    }

    return (
        <>
            <GridLayout
                isEmpty={false}
                emptyState={null}
                gridCols={{ base: 1, sm: 2, lg: 3, xl: 4 }}
                gap={{ base: '3', sm: '4' }}
                padding="p-4"
            >
                {residents.map((resident) => {
                    const isSelected = selectedResidents.includes(resident.id);
                    const isExpanded = expandedId === resident.id;
                    
                    // Calculate all resident data
                    const photoUrl = getPhotoUrl(resident.photo_path, resident.photo_url);
                    const fullName = getFullName(resident);
                    const firstName = typeof resident.first_name === 'string' ? resident.first_name : '';
                    const lastName = typeof resident.last_name === 'string' ? resident.last_name : '';
                    const initials = getInitials(firstName, lastName);
                    const age = calculateAge(resident.birth_date);
                    const householdInfo = getHouseholdInfo(resident);
                    const isHead = isHeadOfHousehold(resident);
                    const hasPhoto = !!photoUrl;
                    
                    // Safely get other properties
                    const address = typeof resident.address === 'string' ? resident.address : '';
                    const contactNumber = typeof resident.contact_number === 'string' ? resident.contact_number : '';
                    const birthDate = typeof resident.birth_date === 'string' ? resident.birth_date : '';
                    const email = typeof resident.email === 'string' ? resident.email : '';
                    const civilStatus = typeof resident.civil_status === 'string' ? resident.civil_status : '';
                    const gender = typeof resident.gender === 'string' ? resident.gender : '';
                    const bloodType = typeof resident.blood_type === 'string' ? resident.blood_type : '';
                    const occupation = typeof resident.occupation === 'string' ? resident.occupation : '';
                    const educationalAttainment = typeof resident.educational_attainment === 'string' ? resident.educational_attainment : '';
                    const notes = typeof resident.notes === 'string' ? resident.notes : '';
                    const isVoter = typeof resident.is_voter === 'boolean' ? resident.is_voter : undefined;
                    
                    // Handle purok
                    const purokName = isPurokObject(resident.purok) 
                        ? resident.purok.name 
                        : typeof resident.purok === 'string' 
                            ? `Purok ${resident.purok}` 
                            : null;
                    
                    // Handle documents
                    const documentsCount = isDocumentArray(resident.documents) ? resident.documents.length : 0;
                    
                    // Truncation lengths
                    const nameLength = isMobile ? 20 : 30;
                    const addressLength = isMobile ? 25 : 40;
                    const householdNameLength = isMobile ? 15 : 25;

                    return (
                        <Card 
                            key={resident.id}
                            className={`overflow-hidden border relative transition-all duration-200 bg-white dark:bg-gray-900 ${
                                isSelected 
                                    ? 'ring-2 ring-blue-500 border-blue-500 shadow-lg shadow-blue-500/20 dark:ring-blue-400 dark:border-blue-400 dark:shadow-blue-400/20' 
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-gray-800/50'
                            } ${isExpanded ? 'shadow-lg' : ''} cursor-pointer`}
                            onClick={(e) => handleCardClick(resident.id, e)}
                        >
                            <CardContent className="p-4">
                                {/* Header with Checkbox and DropdownMenu */}
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        {/* Avatar */}
                                        <Avatar 
                                            className={`h-10 w-10 border-2 ${isSelected ? 'border-blue-500' : 'border-gray-200 dark:border-gray-700'} cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleViewPhoto(resident, e);
                                            }}
                                        >
                                            <AvatarImage src={photoUrl || ''} alt={fullName} />
                                            <AvatarFallback className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 text-sm font-medium">
                                                {initials || '?'}
                                            </AvatarFallback>
                                        </Avatar>
                                        
                                        <div className="min-w-0 flex-1">
                                            <div className="font-medium text-gray-900 dark:text-white truncate flex items-center gap-1">
                                                {truncateText(fullName, nameLength)}
                                                {isHead && (
                                                    <Crown className="h-3.5 w-3.5 text-amber-600 flex-shrink-0" />
                                                )}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                ID: {resident.id}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-1">
                                        {isBulkMode && (
                                            <Checkbox
                                                checked={isSelected}
                                                onCheckedChange={() => onItemSelect(resident.id)}
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
                                                        handleViewDetails(resident.id, e);
                                                    }}
                                                    className="flex items-center gap-2 cursor-pointer"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    <span>View Details</span>
                                                </DropdownMenuItem>
                                                
                                                <DropdownMenuItem 
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleEdit(resident.id, e);
                                                    }}
                                                    className="flex items-center gap-2 cursor-pointer"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                    <span>Edit Profile</span>
                                                </DropdownMenuItem>

                                                {hasPhoto && (
                                                    <DropdownMenuItem 
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            handleViewPhoto(resident, e);
                                                        }}
                                                        className="flex items-center gap-2 cursor-pointer"
                                                    >
                                                        <Camera className="h-4 w-4" />
                                                        <span>View Photo</span>
                                                    </DropdownMenuItem>
                                                )}
                                                
                                                <DropdownMenuSeparator />
                                                
                                                <DropdownMenuItem 
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        onCopyToClipboard(fullName, 'Name');
                                                    }}
                                                    className="flex items-center gap-2 cursor-pointer"
                                                >
                                                    <Clipboard className="h-4 w-4" />
                                                    <span>Copy Name</span>
                                                </DropdownMenuItem>
                                                
                                                  {resident.contact_number && (
                                                    <DropdownMenuItem 
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            window.location.href = `tel:${resident.contact_number}`;
                                                        }}
                                                        className="flex items-center gap-2 cursor-pointer"
                                                    >
                                                        <Phone className="h-4 w-4" />
                                                        <span>Call Resident</span>
                                                    </DropdownMenuItem>
                                                )}
                                                {contactNumber && (
                                                    <DropdownMenuItem 
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            onCopyToClipboard(contactNumber, 'Contact');
                                                        }}
                                                        className="flex items-center gap-2 cursor-pointer"
                                                    >
                                                        <Clipboard className="h-4 w-4" />
                                                        <span>Copy Contact</span>
                                                    </DropdownMenuItem>
                                                )}
                                                
                                                {onGenerateId && (
                                                    <DropdownMenuItem 
                                                        onClick={(e) => handleGenerateId(resident, e)}
                                                        className="flex items-center gap-2 cursor-pointer"
                                                    >
                                                        <QrCode className="h-4 w-4" />
                                                        <span>Generate ID</span>
                                                    </DropdownMenuItem>
                                                )}
                                                
                                                {onCreateClearance && (
                                                    <DropdownMenuItem 
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            onCreateClearance(resident);
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
                                                                onItemSelect(resident.id);
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
                                                
                                                {resident.status !== 'deceased' && (
                                                    <>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem 
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                onDelete(resident);
                                                            }}
                                                            className="flex items-center gap-2 cursor-pointer text-red-600 dark:text-red-400 focus:text-red-700 dark:focus:text-red-300 focus:bg-red-50 dark:focus:bg-red-950/30"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                            <span>Delete Resident</span>
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
                                        className={`text-xs px-2 py-0.5 border ${getStatusColor(resident.status)}`}
                                        title={getStatusLabel(resident.status)}
                                    >
                                        {getStatusLabel(resident.status)}
                                    </Badge>
                                    
                                    {civilStatus && (
                                        <Badge 
                                            variant="outline" 
                                            className={`text-xs px-2 py-0.5 border ${getCivilStatusColor(civilStatus)} border-gray-200 dark:border-gray-700`}
                                        >
                                            <Heart className="h-3 w-3 mr-1" />
                                            {civilStatus}
                                        </Badge>
                                    )}
                                    
                                    {isHead && (
                                        <Badge variant="outline" className="text-xs px-2 py-0.5 bg-amber-50 dark:bg-amber-900/20">
                                            <Crown className="h-3 w-3 mr-1" />
                                            Head
                                        </Badge>
                                    )}
                                    
                                    {hasPhoto && (
                                        <Badge variant="outline" className="text-xs px-2 py-0.5">
                                            <Camera className="h-3 w-3 mr-1" />
                                            Photo
                                        </Badge>
                                    )}
                                </div>

                                {/* Always visible info */}
                                <div className="space-y-2 mb-2">
                                    {/* Age and Gender */}
                                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                        <Calendar className="h-3.5 w-3.5" />
                                        <span>
                                            {age !== null ? `${age} years` : 'Age N/A'} • {gender || 'Gender N/A'}
                                        </span>
                                    </div>

                                    {/* Address */}
                                    {address && (
                                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                                            <span 
                                                className="truncate"
                                                title={address}
                                            >
                                                {truncateAddress(address, addressLength)}
                                            </span>
                                        </div>
                                    )}

                                    {/* Purok */}
                                    {purokName && (
                                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                            <Home className="h-3.5 w-3.5 flex-shrink-0" />
                                            <span>{purokName}</span>
                                        </div>
                                    )}

                                    {/* Contact Number */}
                                    {contactNumber && (
                                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                            <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                                            <span>{formatContactNumber(contactNumber)}</span>
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
                                            onClick={(e) => handleToggleExpand(resident.id, e)}
                                        >
                                            <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                        </button>
                                    </div>
                                )}

                                {/* Expanded Details */}
                                {isExpanded && (
                                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-2 space-y-3 animate-in fade-in-50">
                                        {/* Household Information */}
                                        {householdInfo && (
                                            <div className="flex items-start gap-1 text-sm">
                                                <Users className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
                                                <div className="min-w-0">
                                                    <Link 
                                                        href={`/admin/households/${householdInfo.id}`}
                                                        className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 truncate block"
                                                        title={householdInfo.name}
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        {truncateText(householdInfo.name, householdNameLength)}
                                                    </Link>
                                                    {isHead && (
                                                        <span className="text-xs text-amber-600 dark:text-amber-400">
                                                            Head of Household
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Email */}
                                        {email && (
                                            <div className="flex items-center gap-1 text-sm">
                                                <Mail className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                                <span className="text-gray-700 dark:text-gray-300 truncate">
                                                    {email}
                                                </span>
                                            </div>
                                        )}

                                        {/* Birth Date */}
                                        {birthDate && (
                                            <div className="flex items-center gap-1 text-sm">
                                                <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                                <span className="text-gray-700 dark:text-gray-300">
                                                    Born: {formatDate(birthDate)}
                                                </span>
                                            </div>
                                        )}

                                        {/* Blood Type */}
                                        {bloodType && (
                                            <div className="flex items-center gap-1 text-sm">
                                                <Heart className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                                <span className="text-gray-700 dark:text-gray-300">
                                                    Blood Type: {bloodType}
                                                </span>
                                            </div>
                                        )}

                                        {/* Employment & Education */}
                                        {(occupation || educationalAttainment) && (
                                            <div className="space-y-1">
                                                {occupation && (
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <span className="text-gray-500 dark:text-gray-400">Occupation:</span>
                                                        <span className="text-gray-700 dark:text-gray-300">
                                                            {occupation}
                                                        </span>
                                                    </div>
                                                )}
                                                {educationalAttainment && (
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <span className="text-gray-500 dark:text-gray-400">Education:</span>
                                                        <span className="text-gray-700 dark:text-gray-300">
                                                            {educationalAttainment}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Voter Status */}
                                        {isVoter !== undefined && (
                                            <div className="flex items-center gap-1 text-sm">
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

                                        {/* Notes */}
                                        {notes && (
                                            <div className="text-sm">
                                                <p className="text-gray-500 dark:text-gray-400 mb-1">Notes:</p>
                                                <p className="text-gray-700 dark:text-gray-300 line-clamp-2 italic">
                                                    "{truncateText(notes, 100)}"
                                                </p>
                                            </div>
                                        )}

                                        {/* Documents count */}
                                        {documentsCount > 0 && (
                                            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                                <FileText className="h-4 w-4" />
                                                <span>{documentsCount} document(s)</span>
                                            </div>
                                        )}

                                        {/* View full profile link and collapse button */}
                                        <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                                            <button
                                                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
                                                onClick={(e) => handleViewDetails(resident.id, e)}
                                            >
                                                <ExternalLink className="h-3.5 w-3.5" />
                                                View full profile
                                            </button>
                                            <button
                                                className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                                onClick={(e) => handleToggleExpand(resident.id, e)}
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

            {/* Photo Modal */}
            <PhotoViewModal
                isOpen={photoModalOpen}
                onClose={handleClosePhotoModal}
                resident={selectedResidentForPhoto}
                photoUrl={selectedResidentForPhoto ? getPhotoUrl(selectedResidentForPhoto.photo_path, selectedResidentForPhoto.photo_url) : null}
            />
        </>
    );
}