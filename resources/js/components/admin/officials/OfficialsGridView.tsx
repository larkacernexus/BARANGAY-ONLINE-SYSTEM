// components/admin/officials/OfficialsGridView.tsx
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ActionDropdown, ActionDropdownItem, ActionDropdownSeparator } from '@/components/adminui/action-dropdown';
import { GridLayout } from '@/components/adminui/grid-layout';
import { EmptyState } from '@/components/adminui/empty-state';
import {
    Shield,
    Phone,
    Calendar,
    Edit,
    Eye,
    Trash2,
    Copy,
    Printer
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import { Official } from '@/types/officials';
import { truncateText, getStatusBadgeVariant, formatDate, getPositionBadgeVariant } from '@/admin-utils/officialsUtils';

interface OfficialsGridViewProps {
    officials: Official[];
    isBulkMode: boolean;
    selectedOfficials: number[];
    onItemSelect: (id: number) => void;
    hasActiveFilters: boolean;
    onClearFilters: () => void;
    onDelete: (official: Official) => void;
    onCopyToClipboard: (text: string, label: string) => void;
    positions: Record<string, { name: string; order: number }>;
    committees: Record<string, string>;
    windowWidth: number;
}

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
    
    const emptyState = (
        <EmptyState
            title="No officials found"
            description={hasActiveFilters 
                ? 'Try changing your filters or search criteria.'
                : 'Get started by adding a barangay official.'}
            icon={<Shield className="h-12 w-12 text-gray-300 dark:text-gray-700" />}
            hasFilters={hasActiveFilters}
            onClearFilters={onClearFilters}
            onCreateNew={() => window.location.href = '/admin/officials/create'}
            createLabel="Add Official"
        />
    );

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
                const statusVariant = getStatusBadgeVariant(official.status, official.is_current);
                const positionVariant = getPositionBadgeVariant(official.position);
                
                return (
                    <Card 
                        key={official.id}
                        className={`overflow-hidden transition-all hover:shadow-md ${
                            isSelected ? 'border-blue-500 border-2 bg-blue-50 dark:bg-blue-900/10' : ''
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
                        <CardContent className="p-4">
                            {/* Header - Standard size */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                        {official.photo_url || resident?.photo_url ? (
                                            <img 
                                                src={official.photo_url || resident?.photo_url} 
                                                alt={resident?.full_name || 'Official'}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <Shield className="h-5 w-5 text-blue-600" />
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="font-medium truncate">
                                            {truncateText(resident?.full_name || 'Unknown', 20)}
                                        </div>
                                        <div className="text-xs text-gray-500 truncate">
                                            Barangay Official
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-1">
                                    {isBulkMode && (
                                        <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={() => onItemSelect(official.id)}
                                            onClick={(e) => e.stopPropagation()}
                                            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                        />
                                    )}
                                    <ActionDropdown>
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
                                        
                                        <ActionDropdownItem
                                            icon={<Printer className="h-4 w-4" />}
                                            href={`/admin/officials/${official.id}/print`}
                                        >
                                            Print Details
                                        </ActionDropdownItem>
                                        
                                        <ActionDropdownSeparator />
                                        
                                        <ActionDropdownItem
                                            icon={<Copy className="h-4 w-4" />}
                                            onClick={() => onCopyToClipboard(resident?.full_name || '', 'Official Name')}
                                        >
                                            Copy Name
                                        </ActionDropdownItem>
                                        
                                        <ActionDropdownItem
                                            icon={<Copy className="h-4 w-4" />}
                                            onClick={() => onCopyToClipboard(official.full_position, 'Position')}
                                        >
                                            Copy Position
                                        </ActionDropdownItem>
                                        
                                        {(official.contact_number || resident?.contact_number) && (
                                            <ActionDropdownItem
                                                icon={<Phone className="h-4 w-4" />}
                                                onClick={() => onCopyToClipboard(
                                                    official.contact_number || resident?.contact_number || '', 
                                                    'Contact Number'
                                                )}
                                            >
                                                Copy Contact
                                            </ActionDropdownItem>
                                        )}
                                        
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

                            {/* Content - Optimized spacing */}
                            <div className="space-y-2">
                                {/* Position & Status - Combined section */}
                                <div className="space-y-1">
                                    <div className="text-sm font-medium text-gray-700">Position</div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1">
                                            <Shield className="h-3.5 w-3.5 text-blue-600" />
                                            <span className="font-medium">
                                                {truncateText(official.full_position, 22)}
                                            </span>
                                        </div>
                                        <Badge 
                                            variant={statusVariant.variant as any}
                                            className="text-xs"
                                        >
                                            {statusVariant.text}
                                            {official.is_current && ' • Current'}
                                        </Badge>
                                    </div>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        <Badge variant={positionVariant.variant as any} className="text-xs">
                                            {positionVariant.text}
                                        </Badge>
                                        {official.is_regular ? (
                                            <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                                                Regular
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-xs">
                                                Ex-Officio
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                {/* Contact & Committee - Combined in one row if both exist */}
                                {(official.contact_number || resident?.contact_number || official.committee) && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                        {(official.contact_number || resident?.contact_number) && (
                                            <div className="space-y-1">
                                                <div className="text-xs font-medium text-gray-700">Contact</div>
                                                <div className="flex items-center gap-1 text-sm">
                                                    <Phone className="h-3.5 w-3.5 text-gray-500" />
                                                    <span className="truncate">
                                                        {official.contact_number || resident?.contact_number}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {official.committee && (
                                            <div className="space-y-1">
                                                <div className="text-xs font-medium text-gray-700">Committee</div>
                                                <div className="text-sm truncate">
                                                    {truncateText(committees[official.committee] || official.committee, 18)}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Term - Compact */}
                                <div className="pt-1 border-t">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-1 text-xs text-gray-700">
                                            <Calendar className="h-3.5 w-3.5" />
                                            <span className="font-medium">Term</span>
                                        </div>
                                        <div className="text-sm">
                                            {formatDate(official.term_start)} - {formatDate(official.term_end)}
                                        </div>
                                        {official.term_duration && (
                                            <div className="text-xs text-gray-500">
                                                {official.term_duration}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </GridLayout>
    );
}