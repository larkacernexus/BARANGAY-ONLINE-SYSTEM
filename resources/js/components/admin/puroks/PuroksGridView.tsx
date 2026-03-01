import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ActionDropdown, ActionDropdownItem, ActionDropdownSeparator } from '@/components/adminui/action-dropdown';
import { GridLayout } from '@/components/adminui/grid-layout';
import { EmptyState } from '@/components/adminui/empty-state';
import { Link } from '@inertiajs/react';
import {
    MapPin,
    Eye,
    Edit,
    Users,
    Home,
    Copy,
    Trash2,
    ExternalLink,
    Phone,
    Calendar,
    Users as UsersIcon
} from 'lucide-react';
import { Purok } from '@/types';

interface PuroksGridViewProps {
    puroks: Purok[];
    isBulkMode: boolean;
    selectedPuroks: number[];
    isMobile: boolean;
    onItemSelect: (id: number) => void;
    onDelete: (purok: Purok) => void;
    hasActiveFilters: boolean;
    onClearFilters: () => void;
    selectionStats: any;
    onCopyToClipboard: (text: string, label: string) => void;
}

export default function PuroksGridView({
    puroks,
    isBulkMode,
    selectedPuroks,
    isMobile,
    onItemSelect,
    onDelete,
    hasActiveFilters,
    onClearFilters,
    selectionStats,
    onCopyToClipboard
}: PuroksGridViewProps) {
    const truncateText = (text: string, maxLength: number = 30): string => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
        const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
            'active': 'default',
            'inactive': 'secondary',
            'pending': 'outline',
            'archived': 'outline'
        };
        return variants[status.toLowerCase()] || 'outline';
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const emptyState = (
        <EmptyState
            title="No puroks found"
            description={hasActiveFilters 
                ? 'Try changing your filters or search criteria.'
                : 'Get started by creating a purok.'}
            icon={<MapPin className="h-12 w-12 text-gray-300 dark:text-gray-700" />}
            hasFilters={hasActiveFilters}
            onClearFilters={onClearFilters}
            onCreateNew={() => window.location.href = '/admin/puroks/create'}
            createLabel="Create Purok"
        />
    );

    return (
        <GridLayout
            isEmpty={puroks.length === 0}
            emptyState={emptyState}
            gridCols={{ base: 1, sm: 2, lg: 3, xl: 4 }}
            gap={{ base: '3', sm: '4' }}
            padding="p-4"
        >
            {puroks.map((purok) => {
                const isSelected = selectedPuroks.includes(purok.id);
                
                return (
                    <Card 
                        key={purok.id}
                        className={`overflow-hidden transition-all hover:shadow-md ${
                            isSelected ? 'border-blue-500 border-2 bg-blue-50 dark:bg-blue-900/10' : ''
                        }`}
                        onClick={(e) => {
                            if (isBulkMode && e.target instanceof HTMLElement && 
                                !e.target.closest('a') && 
                                !e.target.closest('button') &&
                                !e.target.closest('.dropdown-menu-content')) {
                                onItemSelect(purok.id);
                            }
                        }}
                    >
                        <CardContent className="p-4">
                            {/* Header with Checkbox and ActionDropdown */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                        <MapPin className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="font-medium truncate">
                                            {purok.name}
                                        </div>
                                        <Badge 
                                            variant={getStatusBadgeVariant(purok.status)} 
                                            className="mt-1 text-xs"
                                        >
                                            {purok.status}
                                        </Badge>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-1">
                                    {isBulkMode && (
                                        <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={() => onItemSelect(purok.id)}
                                            onClick={(e) => e.stopPropagation()}
                                            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                        />
                                    )}
                                    {/* USE ACTIONDROPDOWN - THREE DOTS MENU */}
                                    <ActionDropdown>
                                        <ActionDropdownItem
                                            icon={<Eye className="h-4 w-4" />}
                                            href={`/admin/puroks/${purok.id}`}
                                        >
                                            View Details
                                        </ActionDropdownItem>
                                        
                                        <ActionDropdownItem
                                            icon={<Edit className="h-4 w-4" />}
                                            href={`/admin/puroks/${purok.id}/edit`}
                                        >
                                            Edit Purok
                                        </ActionDropdownItem>
                                        
                                        <ActionDropdownSeparator />
                                        
                                        <ActionDropdownItem
                                            icon={<Copy className="h-4 w-4" />}
                                            onClick={() => onCopyToClipboard(purok.name, 'Purok Name')}
                                        >
                                            Copy Name
                                        </ActionDropdownItem>
                                        
                                        {purok.google_maps_url && (
                                            <ActionDropdownItem
                                                icon={<ExternalLink className="h-4 w-4" />}
                                                onClick={() => window.open(purok.google_maps_url, '_blank')}
                                            >
                                                View on Map
                                            </ActionDropdownItem>
                                        )}
                                        
                                        <ActionDropdownSeparator />
                                        
                                        <ActionDropdownItem
                                            icon={<Trash2 className="h-4 w-4" />}
                                            onClick={() => onDelete(purok)}
                                            dangerous
                                        >
                                            Delete Purok
                                        </ActionDropdownItem>
                                    </ActionDropdown>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="space-y-3">
                                {/* Description */}
                                {purok.description && (
                                    <div className="space-y-1">
                                        <div className="text-sm font-medium text-gray-700">Description</div>
                                        <div className="text-sm text-gray-600 line-clamp-2">
                                            {purok.description}
                                        </div>
                                    </div>
                                )}

                                {/* Leader Info */}
                                {purok.leader_name && (
                                    <div className="space-y-1">
                                        <div className="text-sm font-medium text-gray-700">Leader</div>
                                        <div className="text-gray-900">
                                            {purok.leader_name}
                                        </div>
                                        {purok.leader_contact && (
                                            <div className="flex items-center gap-1 text-sm text-gray-600">
                                                <Phone className="h-3.5 w-3.5" />
                                                {purok.leader_contact}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Stats */}
                                <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-1 text-sm text-gray-600">
                                            <Home className="h-3.5 w-3.5" />
                                            <span className="font-medium">Households</span>
                                        </div>
                                        <div className="text-lg font-semibold text-center">
                                            {purok.total_households?.toLocaleString() || 0}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-1 text-sm text-gray-600">
                                            <UsersIcon className="h-3.5 w-3.5" />
                                            <span className="font-medium">Residents</span>
                                        </div>
                                        <div className="text-lg font-semibold text-center">
                                            {purok.total_residents?.toLocaleString() || 0}
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Links & Created Date */}
                                <div className="pt-2 border-t">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                            <Calendar className="h-3 w-3" />
                                            {formatDate(purok.created_at)}
                                        </div>
                                        <div className="flex gap-1">
                                            <Link href={`/residents?purok_id=${purok.id}`}>
                                                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                                                    Residents
                                                </Button>
                                            </Link>
                                            <Link href={`/households?purok_id=${purok.id}`}>
                                                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                                                    Households
                                                </Button>
                                            </Link>
                                        </div>
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