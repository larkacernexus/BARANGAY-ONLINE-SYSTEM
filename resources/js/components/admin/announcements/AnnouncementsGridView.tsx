import { AnnouncementCard } from './AnnouncementCard';
import { EmptyState } from '@/components/adminui/empty-state';
import { GridLayout } from '@/components/adminui/grid-layout'; // Import the grid layout
import { Megaphone } from 'lucide-react';
import { router } from '@inertiajs/react';
import { Announcement } from '@/types';
import { announcementUtils } from '@/admin-utils/announcement-utils';

interface AnnouncementsGridViewProps {
    announcements: Announcement[];
    isBulkMode: boolean;
    selectedAnnouncements: number[];
    isMobile: boolean;
    onItemSelect: (id: number) => void;
    onDelete: (announcement: Announcement) => void;
    onToggleStatus: (announcement: Announcement) => void;
    hasActiveFilters: boolean;
    onClearFilters: () => void;
}

export default function AnnouncementsGridView({
    announcements,
    isBulkMode,
    selectedAnnouncements,
    isMobile,
    onItemSelect,
    onDelete,
    onToggleStatus,
    hasActiveFilters,
    onClearFilters
}: AnnouncementsGridViewProps) {
    // Create empty state component
    const emptyState = (
        <EmptyState
            title="No announcements found"
            description={hasActiveFilters 
                ? 'Try changing your filters or search criteria.'
                : 'Get started by creating an announcement.'}
            icon={<Megaphone className="h-12 w-12 text-gray-300 dark:text-gray-700" />}
            hasFilters={hasActiveFilters}
            onClearFilters={onClearFilters}
            onCreateNew={() => router.get('/announcements/create')}
            createLabel="Create Announcement"
        />
    );

    return (
        <GridLayout
            isEmpty={announcements.length === 0}
            emptyState={emptyState}
            gridCols={{ base: 1, sm: 2, lg: 3, xl: 4 }}
            gap={{ base: '3', sm: '4' }}
            padding="p-4"
        >
            {announcements.map(announcement => (
                <AnnouncementCard
                    key={announcement.id}
                    announcement={announcement}
                    isSelected={selectedAnnouncements.includes(announcement.id)}
                    isBulkMode={isBulkMode}
                    isMobile={isMobile}
                    onSelect={onItemSelect}
                    onDelete={onDelete}
                    onToggleStatus={onToggleStatus}
                    truncateText={announcementUtils.truncateText}
                    formatDate={announcementUtils.formatDate}
                    getTypeColor={announcementUtils.getTypeColor}
                    getPriorityColor={announcementUtils.getPriorityColor}
                />
            ))}
        </GridLayout>
    );
}