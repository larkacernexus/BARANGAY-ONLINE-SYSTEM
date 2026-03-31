// components/admin/officials/OfficialsGridView.tsx
import React, { useCallback, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ActionDropdown, ActionDropdownItem, ActionDropdownSeparator } from '@/components/adminui/action-dropdown';
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
    MapPin,
    Users,
    Briefcase
} from 'lucide-react';
import { Official, OfficialsGridViewProps } from '@/types/admin/officials/officials';
import { toast } from 'sonner';

// Helper functions (can be moved to utils file)
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

const getStatusBadgeVariant = (status: string, isCurrent?: boolean): { variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info'; className: string; text: string } => {
    const variants = {
        'active': { 
            variant: 'success' as const, 
            className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            text: 'Active'
        },
        'inactive': { 
            variant: 'secondary' as const, 
            className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
            text: 'Inactive'
        },
        'former': { 
            variant: 'outline' as const, 
            className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
            text: 'Former'
        },
        'current': { 
            variant: 'default' as const, 
            className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            text: 'Current'
        }
    };
    
    if (isCurrent) return variants.current;
    return variants[status as keyof typeof variants] || variants.inactive;
};

const getPositionBadgeVariant = (position: string): { variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string; text: string } => {
    const variants: Record<string, any> = {
        'Captain': { variant: 'destructive', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
        'Councilor': { variant: 'default', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
        'SK Chairman': { variant: 'default', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
        'SK Councilor': { variant: 'default', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' },
        'Secretary': { variant: 'secondary', className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' },
        'Treasurer': { variant: 'secondary', className: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400' }
    };
    
    const matched = Object.keys(variants).find(key => position.toLowerCase().includes(key.toLowerCase()));
    const variant = matched ? variants[matched] : variants['Councilor'];
    
    return {
        ...variant,
        text: position
    };
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
    windowWidth
}: OfficialsGridViewProps) {
    
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

    // Determine truncation length based on screen size
    const truncationLength = useMemo(() => {
        if (windowWidth < 640) return 15;
        if (windowWidth < 768) return 18;
        if (windowWidth < 1024) return 20;
        return 25;
    }, [windowWidth]);

    return (
        <GridLayout
            isEmpty={officials.length === 0}
            emptyState={emptyState}
            gridCols={{ base: 1, sm: 2, lg: 3, xl: 4 }}
            gap={{ base: '3', sm: '4' }}
            padding="p-4"
        >
            {officials.map((official) => {
                const isSelected = selectedOfficials.includes(official.id);
                const resident = official.resident;
                const position = official.positionData || official.position;
                const committee = official.committeeData || official.committee;
                
                const statusVariant = getStatusBadgeVariant(official.status, official.is_current);
                const positionVariant = position ? getPositionBadgeVariant(
                    typeof position === 'string' ? position : position.name
                ) : null;
                
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
                        className={`overflow-hidden transition-all hover:shadow-md bg-white dark:bg-gray-900 border ${
                            isSelected 
                                ? 'border-blue-500 border-2 bg-blue-50 dark:bg-blue-900/20' 
                                : 'border-gray-200 dark:border-gray-700'
                        }`}
                        onClick={(e) => {
                            if (isBulkMode && e.target instanceof HTMLElement && 
                                !e.target.closest('a') && 
                                !e.target.closest('button') &&
                                !e.target.closest('.dropdown-menu-content')) {
                                onItemSelect(official.id);
                            }
                        }}
                    >
                        <CardContent className="p-3 sm:p-4">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2 min-w-0 flex-1">
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
                                        <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                            {truncateText(fullName, truncationLength)}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                            {truncateText(positionName, truncationLength)}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                                    {isBulkMode && (
                                        <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={() => onItemSelect(official.id)}
                                            onClick={(e) => e.stopPropagation()}
                                            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 border-gray-300 dark:border-gray-600"
                                        />
                                    )}
                                    <ActionDropdown>
                                        {/* Quick Actions */}
                                        <ActionDropdownItem
                                            icon={<Eye className="h-4 w-4" />}
                                            href={`/admin/officials/${official.id}`}
                                        >
                                            View Details
                                        </ActionDropdownItem>
                                        
                                        <ActionDropdownItem
                                            icon={<Edit className="h-4 w-4" />}
                                            href={`/admin/officials/${official.id}/edit`}
                                        >
                                            Edit Official
                                        </ActionDropdownItem>
                                        
                                        {resident?.id && (
                                            <ActionDropdownItem
                                                icon={<User className="h-4 w-4" />}
                                                href={`/admin/residents/${resident.id}`}
                                            >
                                                View Resident
                                            </ActionDropdownItem>
                                        )}
                                        
                                        <ActionDropdownSeparator />
                                        
                                        {/* Status Management */}
                                        <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                                            Change Status
                                        </div>
                                        
                                        {official.status !== 'active' && (
                                            <ActionDropdownItem
                                                icon={<CheckCircle className="h-4 w-4" />}
                                                onClick={() => handleStatusChange(official, 'active')}
                                                className="text-green-600 dark:text-green-400"
                                            >
                                                Set as Active
                                            </ActionDropdownItem>
                                        )}
                                        
                                        {official.status !== 'inactive' && (
                                            <ActionDropdownItem
                                                icon={<Clock className="h-4 w-4" />}
                                                onClick={() => handleStatusChange(official, 'inactive')}
                                                className="text-yellow-600 dark:text-yellow-400"
                                            >
                                                Set as Inactive
                                            </ActionDropdownItem>
                                        )}
                                        
                                        {official.status !== 'former' && (
                                            <ActionDropdownItem
                                                icon={<AlertCircle className="h-4 w-4" />}
                                                onClick={() => handleStatusChange(official, 'former')}
                                                className="text-gray-600 dark:text-gray-400"
                                            >
                                                Set as Former
                                            </ActionDropdownItem>
                                        )}
                                        
                                        <ActionDropdownSeparator />
                                        
                                        {/* Term Management */}
                                        {official.status === 'active' && (
                                            <ActionDropdownItem
                                                icon={<PowerOff className="h-4 w-4" />}
                                                onClick={() => handleEndTerm(official)}
                                                className="text-orange-600 dark:text-orange-400"
                                            >
                                                End Term
                                            </ActionDropdownItem>
                                        )}
                                        
                                        {official.status === 'former' && (
                                            <ActionDropdownItem
                                                icon={<RefreshCw className="h-4 w-4" />}
                                                onClick={() => handleReactivate(official)}
                                                className="text-blue-600 dark:text-blue-400"
                                            >
                                                Reactivate
                                            </ActionDropdownItem>
                                        )}
                                        
                                        <ActionDropdownSeparator />
                                        
                                        {/* Copy Options */}
                                        <ActionDropdownItem
                                            icon={<Copy className="h-4 w-4" />}
                                            onClick={() => onCopyToClipboard(fullName, 'Official Name')}
                                        >
                                            Copy Name
                                        </ActionDropdownItem>
                                        
                                        <ActionDropdownItem
                                            icon={<Copy className="h-4 w-4" />}
                                            onClick={() => onCopyToClipboard(positionName, 'Position')}
                                        >
                                            Copy Position
                                        </ActionDropdownItem>
                                        
                                        {contactNumber && (
                                            <ActionDropdownItem
                                                icon={<Phone className="h-4 w-4" />}
                                                onClick={() => onCopyToClipboard(contactNumber, 'Contact Number')}
                                            >
                                                Copy Contact
                                            </ActionDropdownItem>
                                        )}
                                        
                                        <ActionDropdownSeparator />
                                        
                                        <ActionDropdownItem
                                            icon={<Printer className="h-4 w-4" />}
                                            href={`/admin/officials/${official.id}/print`}
                                        >
                                            Print Details
                                        </ActionDropdownItem>
                                        
                                        <ActionDropdownSeparator />
                                        
                                        <ActionDropdownItem
                                            icon={<Trash2 className="h-4 w-4" />}
                                            onClick={() => onDelete(official)}
                                            dangerous
                                        >
                                            Delete Official
                                        </ActionDropdownItem>
                                    </ActionDropdown>
                                </div>
                            </div>

                            {/* Status Badge and Type - Compact row */}
                            <div className="flex flex-wrap items-center gap-1.5 mb-2">
                                <Badge 
                                    variant={statusVariant.variant}
                                    className={`text-xs px-2 py-0.5 ${statusVariant.className}`}
                                >
                                    {statusVariant.text}
                                    {official.is_current && ' • Current'}
                                </Badge>
                                
                                {positionVariant && (
                                    <Badge variant={positionVariant.variant} className={`text-xs px-2 py-0.5 ${positionVariant.className}`}>
                                        {positionVariant.text}
                                    </Badge>
                                )}
                                
                                <Badge 
                                    variant={official.is_regular ? "default" : "outline"} 
                                    className={`text-xs px-2 py-0.5 ${
                                        official.is_regular 
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                                            : 'dark:border-gray-700 dark:text-gray-400'
                                    }`}
                                >
                                    {official.is_regular ? 'Regular' : 'Ex-Officio'}
                                </Badge>
                            </div>

                            {/* Compact Info Grid */}
                            <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                                {committeeName && (
                                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400 min-w-0">
                                        <Users className="h-3.5 w-3.5 flex-shrink-0 text-gray-500 dark:text-gray-400" />
                                        <span className="truncate text-xs">
                                            {truncateText(committeeName, truncationLength - 5)}
                                        </span>
                                    </div>
                                )}
                                
                                {contactNumber && (
                                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400 min-w-0">
                                        <Phone className="h-3.5 w-3.5 flex-shrink-0 text-gray-500 dark:text-gray-400" />
                                        <span className="truncate text-xs">
                                            {contactNumber}
                                        </span>
                                    </div>
                                )}
                                
                                {official.user && (
                                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400 min-w-0 col-span-2">
                                        <Briefcase className="h-3.5 w-3.5 flex-shrink-0 text-gray-500 dark:text-gray-400" />
                                        <span className="truncate text-xs">
                                            User Account: {official.user.username || official.user.email}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Term Info - Compact */}
                            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                        <Calendar className="h-3.5 w-3.5" />
                                        <span>
                                            {formatDate(official.term_start)} - {formatDate(official.term_end)}
                                        </span>
                                    </div>
                                    {official.term_duration && (
                                        <span className="text-gray-500 dark:text-gray-500">
                                            {official.term_duration}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </GridLayout>
    );
}