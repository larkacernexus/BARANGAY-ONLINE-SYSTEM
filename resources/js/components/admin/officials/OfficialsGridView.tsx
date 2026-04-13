// components/admin/officials/OfficialsGridView.tsx

import React, { useCallback, useMemo, useState, useEffect } from 'react';
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
import { GridLayout } from '@/components/adminui/grid-layout';
import { EmptyState } from '@/components/adminui/empty-state';
import { Link, router } from '@inertiajs/react';
import {
    Shield,
    Phone,
    Calendar,
    Edit,
    Eye,
    Trash2,
    Copy,
    Printer,
    User,
    CheckCircle,
    Clock,
    AlertCircle,
    RefreshCw,
    PowerOff,
    Users,
    Briefcase,
    MoreVertical,
    ChevronDown,
    ChevronUp,
    ExternalLink,
    Square,
    CheckSquare,
} from 'lucide-react';
import { Official, OfficialsGridViewProps } from '@/types/admin/officials/officials';
import { toast } from 'sonner';

// Helper functions
const truncateText = (text: string | null | undefined, maxLength: number): string => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

const getStatusColor = (status: string, isCurrent?: boolean): string => {
    if (isCurrent) {
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
    }
    
    const colors: Record<string, string> = {
        'active': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
        'inactive': 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
        'former': 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800'
    };
    return colors[status] || colors.inactive;
};

const getStatusText = (status: string, isCurrent?: boolean): string => {
    if (isCurrent) return 'Current';
    
    const texts: Record<string, string> = {
        'active': 'Active',
        'inactive': 'Inactive',
        'former': 'Former'
    };
    return texts[status] || 'Inactive';
};

const getPositionColor = (position: string): string => {
    const colors: Record<string, string> = {
        'Captain': 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
        'Councilor': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
        'SK Chairman': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
        'SK Councilor': 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
        'Secretary': 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800',
        'Treasurer': 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800'
    };
    
    const matched = Object.keys(colors).find(key => position.toLowerCase().includes(key.toLowerCase()));
    return matched ? colors[matched] : colors['Councilor'];
};

export default function OfficialsGridView({
    officials,
    isBulkMode,
    selectedOfficials,
    onItemSelect,
    hasActiveFilters,
    onClearFilters,
    onDelete,
    onCopyToClipboard,
    positions,
    committees,
    windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1024
}: OfficialsGridViewProps) {
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [devicePixelRatio, setDevicePixelRatio] = useState(1);
    
    useEffect(() => {
        setDevicePixelRatio(window.devicePixelRatio || 1);
    }, []);
    
    // Determine grid columns - 3 for laptops, 4 for wide screens
    const gridCols = useMemo(() => {
        if (windowWidth < 640) return 1;      // Mobile: 1 column
        if (windowWidth < 1024) return 2;     // Tablet: 2 columns
        if (windowWidth < 1800) return 3;     // Laptop (including 110% scaling): 3 columns
        return 4;                              // Wide desktop: 4 columns
    }, [windowWidth, devicePixelRatio]);
    
    // Determine truncation length based on grid columns
    const truncationLength = useMemo(() => {
        if (gridCols >= 4) return 22;
        if (gridCols === 3) return 20;
        if (gridCols === 2) return 18;
        return 15;
    }, [gridCols]);

    // Toggle card expansion
    const handleToggleExpand = useCallback((id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedId(prev => prev === id ? null : id);
    }, []);

    // Handle card click
    const handleCardClick = (officialId: number, e: React.MouseEvent) => {
        if (isBulkMode) {
            e.stopPropagation();
            return;
        }
        e.stopPropagation();
        handleToggleExpand(officialId, e);
    };
    
    // Handle status change
    const handleStatusChange = useCallback((official: Official, newStatus: 'active' | 'inactive' | 'former') => {
        const statusLabels = {
            active: 'Active',
            inactive: 'Inactive',
            former: 'Former'
        };

        router.put(`/admin/officials/${official.id}`, {
            resident_id: official.resident_id,
            position_id: official.position_id,
            committee_id: official.committee_id,
            term_start: official.term_start,
            term_end: official.term_end,
            status: newStatus,
            order: official.order,
            responsibilities: official.responsibilities,
            contact_number: official.contact_number,
            email: official.email,
            achievements: official.achievements,
            is_regular: official.is_regular,
            user_id: official.user_id
        }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`Official status changed to ${statusLabels[newStatus]}`);
            },
            onError: (errors) => {
                console.error('Status change error:', errors);
                toast.error('Failed to change official status');
            }
        });
    }, []);

    // Handle term end (make former)
    const handleEndTerm = useCallback((official: Official) => {
        if (confirm(`Are you sure you want to end ${official.resident?.full_name || 'this official'}'s term?`)) {
            router.post(`/admin/officials/${official.id}/end-term`, {}, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Term ended successfully. Official marked as former.');
                },
                onError: (errors: any) => {
                    console.error('End term error:', errors);
                    toast.error(errors.error || 'Failed to end term');
                }
            });
        }
    }, []);

    // Handle reactivate
    const handleReactivate = useCallback((official: Official) => {
        if (confirm(`Reactivate ${official.resident?.full_name || 'this official'}?`)) {
            router.post(`/admin/officials/${official.id}/reactivate`, {}, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Official reactivated successfully');
                },
                onError: (errors: any) => {
                    console.error('Reactivate error:', errors);
                    toast.error(errors.error || 'Failed to reactivate official');
                }
            });
        }
    }, []);
    
    // Memoize selected set for quick lookup
    const selectedSet = useMemo(() => new Set(selectedOfficials), [selectedOfficials]);
    
    const emptyState = useMemo(() => (
        <EmptyState
            title="No officials found"
            description={hasActiveFilters 
                ? 'Try changing your filters or search criteria.'
                : 'Get started by adding a barangay official.'}
            icon={<Shield className="h-12 w-12 text-gray-400 dark:text-gray-600" />}
            hasFilters={hasActiveFilters}
            onClearFilters={onClearFilters}
            onCreateNew={() => window.location.href = '/admin/officials/create'}
            createLabel="Add Official"
        />
    ), [hasActiveFilters, onClearFilters]);

    // Early return for empty state
    if (officials.length === 0) {
        return emptyState;
    }

    return (
        <GridLayout
            isEmpty={false}
            emptyState={null}
            gridCols={{ base: 1, sm: 2, lg: 3, xl: gridCols as 1 | 2 | 3 | 4 }}
            gap={{ base: '3', sm: '4' }}
            padding="p-4"
        >
            {officials.map((official) => {
                const isSelected = selectedSet.has(official.id);
                const isExpanded = expandedId === official.id;
                const resident = official.resident;
                const position = official.positionData || official.position;
                const committee = official.committeeData || official.committee;
                
                const fullName = resident?.full_name || official.full_name || 'Unknown';
                const positionName = position 
                    ? (typeof position === 'string' ? position : position.name)
                    : 'Unknown Position';
                const committeeName = committee
                    ? (typeof committee === 'string' ? committees[committee] || committee : committee.name)
                    : null;
                const contactNumber = official.contact_number || resident?.contact_number;
                const photoUrl = official.photo_url || resident?.photo_url;
                
                return (
                    <Card 
                        key={official.id}
                        className={`overflow-hidden border relative transition-all duration-200 bg-white dark:bg-gray-900 ${
                            isSelected 
                                ? 'ring-2 ring-blue-500 border-blue-500 shadow-lg shadow-blue-500/20 dark:ring-blue-400 dark:border-blue-400' 
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg'
                        } ${isExpanded ? 'shadow-lg' : ''} cursor-pointer`}
                        onClick={(e) => handleCardClick(official.id, e)}
                    >
                        <CardContent className="p-4">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                        {photoUrl ? (
                                            <img 
                                                src={photoUrl} 
                                                alt={fullName}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="font-medium text-gray-900 dark:text-white truncate">
                                            {truncateText(fullName, truncationLength)}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                            {truncateText(positionName, truncationLength - 5)}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-1 ml-2">
                                    {isBulkMode && (
                                        <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={() => onItemSelect(official.id)}
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
                                        <DropdownMenuContent align="end" className="w-56">
                                            <DropdownMenuItem asChild>
                                                <Link href={`/admin/officials/${official.id}`} className="flex items-center">
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    View Details
                                                </Link>
                                            </DropdownMenuItem>
                                            
                                            <DropdownMenuItem asChild>
                                                <Link href={`/admin/officials/${official.id}/edit`} className="flex items-center">
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Edit Official
                                                </Link>
                                            </DropdownMenuItem>
                                            
                                            {resident?.id && (
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/admin/residents/${resident.id}`} className="flex items-center">
                                                        <User className="h-4 w-4 mr-2" />
                                                        View Resident
                                                    </Link>
                                                </DropdownMenuItem>
                                            )}
                                            
                                            <DropdownMenuSeparator />
                                            
                                            {/* Status Management */}
                                            <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
                                                Change Status
                                            </div>
                                            
                                            {official.status !== 'active' && (
                                                <DropdownMenuItem onClick={() => handleStatusChange(official, 'active')}>
                                                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                                    Set as Active
                                                </DropdownMenuItem>
                                            )}
                                            
                                            {official.status !== 'inactive' && (
                                                <DropdownMenuItem onClick={() => handleStatusChange(official, 'inactive')}>
                                                    <Clock className="h-4 w-4 mr-2 text-yellow-600" />
                                                    Set as Inactive
                                                </DropdownMenuItem>
                                            )}
                                            
                                            {official.status !== 'former' && (
                                                <DropdownMenuItem onClick={() => handleStatusChange(official, 'former')}>
                                                    <AlertCircle className="h-4 w-4 mr-2 text-gray-600" />
                                                    Set as Former
                                                </DropdownMenuItem>
                                            )}
                                            
                                            <DropdownMenuSeparator />
                                            
                                            {/* Term Management */}
                                            {official.status === 'active' && (
                                                <DropdownMenuItem onClick={() => handleEndTerm(official)}>
                                                    <PowerOff className="h-4 w-4 mr-2 text-orange-600" />
                                                    End Term
                                                </DropdownMenuItem>
                                            )}
                                            
                                            {official.status === 'former' && (
                                                <DropdownMenuItem onClick={() => handleReactivate(official)}>
                                                    <RefreshCw className="h-4 w-4 mr-2 text-blue-600" />
                                                    Reactivate
                                                </DropdownMenuItem>
                                            )}
                                            
                                            <DropdownMenuSeparator />
                                            
                                            {/* Copy Options */}
                                            <DropdownMenuItem onClick={() => onCopyToClipboard(fullName, 'Official Name')}>
                                                <Copy className="h-4 w-4 mr-2" />
                                                Copy Name
                                            </DropdownMenuItem>
                                            
                                            <DropdownMenuItem onClick={() => onCopyToClipboard(positionName, 'Position')}>
                                                <Copy className="h-4 w-4 mr-2" />
                                                Copy Position
                                            </DropdownMenuItem>
                                            
                                            {contactNumber && (
                                                <DropdownMenuItem onClick={() => onCopyToClipboard(contactNumber, 'Contact Number')}>
                                                    <Phone className="h-4 w-4 mr-2" />
                                                    Copy Contact
                                                </DropdownMenuItem>
                                            )}
                                            
                                            <DropdownMenuSeparator />
                                            
                                            <DropdownMenuItem asChild>
                                                <Link href={`/admin/officials/${official.id}/print`} className="flex items-center">
                                                    <Printer className="h-4 w-4 mr-2" />
                                                    Print Details
                                                </Link>
                                            </DropdownMenuItem>

                                            {isBulkMode && (
                                                <>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => onItemSelect(official.id)}>
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
                                            
                                            <DropdownMenuItem 
                                                className="text-red-600 dark:text-red-400"
                                                onClick={() => onDelete(official)}
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Delete Official
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>

                            {/* Status Badges */}
                            <div className="flex flex-wrap gap-1.5 mb-3">
                                <Badge 
                                    variant="outline" 
                                    className={`text-xs px-2 py-0.5 ${getStatusColor(official.status, official.is_current)}`}
                                >
                                    {getStatusText(official.status, official.is_current)}
                                </Badge>
                                
                                <Badge 
                                    variant="outline" 
                                    className={`text-xs px-2 py-0.5 ${getPositionColor(positionName)}`}
                                >
                                    {positionName}
                                </Badge>
                                
                                <Badge 
                                    variant="outline" 
                                    className={`text-xs px-2 py-0.5 ${
                                        official.is_regular 
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                                    }`}
                                >
                                    {official.is_regular ? 'Regular' : 'Ex-Officio'}
                                </Badge>
                            </div>

                            {/* Committee Info */}
                            {committeeName && (
                                <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 mb-2">
                                    <Users className="h-3.5 w-3.5 flex-shrink-0" />
                                    <span className="truncate">
                                        {truncateText(committeeName, truncationLength - 5)}
                                    </span>
                                </div>
                            )}

                            {/* Contact */}
                            {contactNumber && (
                                <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 mb-2">
                                    <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                                    <span>{contactNumber}</span>
                                </div>
                            )}

                            {/* User Account */}
                            {official.user && (
                                <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 mb-2">
                                    <Briefcase className="h-3.5 w-3.5 flex-shrink-0" />
                                    <span className="truncate">
                                        {official.user.username || official.user.email}
                                    </span>
                                </div>
                            )}

                            {/* Term Info */}
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-2">
                                <Calendar className="h-3 w-3 flex-shrink-0" />
                                <span>
                                    {formatDate(official.term_start)} - {formatDate(official.term_end)}
                                </span>
                                {official.term_duration && (
                                    <span className="ml-auto">{official.term_duration}</span>
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
                                        onClick={(e) => handleToggleExpand(official.id, e)}
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
                                    {/* Responsibilities */}
                                    {official.responsibilities && (
                                        <div className="text-sm">
                                            <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Responsibilities:</p>
                                            <p className="text-gray-600 dark:text-gray-400 line-clamp-3">
                                                {official.responsibilities}
                                            </p>
                                        </div>
                                    )}

                                    {/* Achievements */}
                                    {official.achievements && (
                                        <div className="text-sm">
                                            <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Achievements:</p>
                                            <p className="text-gray-600 dark:text-gray-400 line-clamp-3">
                                                {official.achievements}
                                            </p>
                                        </div>
                                    )}

                                    {/* Email */}
                                    {official.email && (
                                        <div className="text-sm">
                                            <span className="text-gray-500 dark:text-gray-400">Email:</span>
                                            <span className="text-gray-900 dark:text-white ml-1">{official.email}</span>
                                        </div>
                                    )}

                                    {/* Order */}
                                    <div className="text-sm">
                                        <span className="text-gray-500 dark:text-gray-400">Order:</span>
                                        <span className="text-gray-900 dark:text-white ml-1">{official.order ?? 'N/A'}</span>
                                    </div>

                                    {/* View full details link */}
                                    <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                                        <Link
                                            href={`/admin/officials/${official.id}`}
                                            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1.5"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <ExternalLink className="h-3.5 w-3.5" />
                                            View full details
                                        </Link>
                                        <button
                                            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                            onClick={(e) => handleToggleExpand(official.id, e)}
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
    );
} 