// resources/js/components/admin/announcements/AnnouncementsDialogs.tsx

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2, AlertTriangle } from 'lucide-react';
import { SelectionStats, BulkOperation } from '@/types/admin/announcements/announcement.types';

interface AnnouncementsDialogsProps {
    showBulkDeleteDialog: boolean;
    setShowBulkDeleteDialog: (value: boolean) => void;
    isPerformingBulkAction: boolean;
    selectedAnnouncements: number[];
    handleBulkOperation: (operation: BulkOperation) => Promise<void>;
    selectionStats?: SelectionStats;
}

export default function AnnouncementsDialogs({
    showBulkDeleteDialog,
    setShowBulkDeleteDialog,
    isPerformingBulkAction,
    selectedAnnouncements,
    handleBulkOperation,
    selectionStats
}: AnnouncementsDialogsProps) {
    const currentlyActiveCount = selectionStats?.active || 0;
    
    return (
        <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
            <AlertDialogContent className="sm:max-w-md">
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Selected Announcements</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete {selectedAnnouncements.length} selected announcement{selectedAnnouncements.length !== 1 ? 's' : ''}?
                        This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                {currentlyActiveCount > 0 && (
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <div className="flex items-start gap-2">
                            <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                            <p className="text-sm text-yellow-700 dark:text-yellow-400">
                                Warning: {currentlyActiveCount} selected announcement(s) are currently active
                                and being displayed to residents. They will be removed immediately.
                            </p>
                        </div>
                    </div>
                )}
                <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                    <AlertDialogCancel disabled={isPerformingBulkAction} className="w-full sm:w-auto">
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={() => handleBulkOperation('delete')}
                        className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto"
                        disabled={isPerformingBulkAction}
                    >
                        {isPerformingBulkAction ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            'Delete Selected'
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}