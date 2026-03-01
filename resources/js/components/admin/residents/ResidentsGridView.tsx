// @/components/admin/residents/residents-grid-view.tsx
import { ResidentCard } from '@/components/admin/residents/resident-card';
import { EmptyState } from '@/components/adminui/empty-state';
import { User } from 'lucide-react';
import { router } from '@inertiajs/react';
import { Resident } from '@/types';
import { GridLayout } from '@/components/adminui/grid-layout'; // Import the layout
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
}

export default function ResidentsGridView({
    residents,
    isBulkMode,
    selectedResidents,
    isMobile,
    onItemSelect,
    hasActiveFilters,
    onClearFilters
}: ResidentsGridViewProps) {
    // Create the empty state component
    const emptyState = (
        <EmptyState
            title="No residents found"
            description={hasActiveFilters 
                ? 'Try changing your filters or search criteria.'
                : 'Get started by adding a resident.'}
            icon={<User className="h-12 w-12 text-gray-300 dark:text-gray-700" />}
            hasFilters={hasActiveFilters}
            onClearFilters={onClearFilters}
            onCreateNew={() => router.get('/admin/residents/create')}
            createLabel="Add Resident"
        />
    );

    return (
        <GridLayout
            isEmpty={residents.length === 0}
            emptyState={emptyState}
            gridCols={{ base: 1, sm: 2, lg: 3, xl: 4 }}
            gap={{ base: '3', sm: '4' }}
            padding="p-4"
        >
            {residents.map(resident => (
                <ResidentCard
                    key={resident.id}
                    resident={resident}
                    isSelected={selectedResidents.includes(resident.id)}
                    isBulkMode={isBulkMode}
                    isMobile={isMobile}
                    onSelect={onItemSelect}
                    onDelete={() => {}}
                    onViewPhoto={() => {}}
                    truncateText={truncateText}
                    truncateAddress={truncateAddress}
                    formatContactNumber={formatContactNumber}
                    getPhotoUrl={getPhotoUrl}
                    getFullName={getFullName}
                    isHeadOfHousehold={isHeadOfHousehold}
                    getStatusBadgeVariant={getStatusBadgeVariant}
                    getStatusLabel={getStatusLabel}
                    getHouseholdInfo={getHouseholdInfo}
                />
            ))}
        </GridLayout>
    );
}