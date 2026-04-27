// resources/js/components/admin/banners/BannersDialogs.tsx

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
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface BannersDialogsProps {
    showBulkDeleteDialog: boolean;
    setShowBulkDeleteDialog: (show: boolean) => void;
    showBulkStatusDialog: boolean;
    setShowBulkStatusDialog: (show: boolean) => void;
    showBulkAudienceDialog: boolean;
    setShowBulkAudienceDialog: (show: boolean) => void;
    isPerformingBulkAction: boolean;
    selectedBanners: number[];
    handleBulkOperation: () => void;
    handleBulkStatusUpdate: () => void;
    handleBulkAudienceUpdate: () => void;
    selectionStats: any;
    bulkEditValue: string;
    setBulkEditValue: (value: string) => void;
}

export default function BannersDialogs({
    showBulkDeleteDialog,
    setShowBulkDeleteDialog,
    showBulkStatusDialog,
    setShowBulkStatusDialog,
    showBulkAudienceDialog,
    setShowBulkAudienceDialog,
    isPerformingBulkAction,
    selectedBanners,
    handleBulkOperation,
    handleBulkStatusUpdate,
    handleBulkAudienceUpdate,
    selectionStats,
    bulkEditValue,
    setBulkEditValue
}: BannersDialogsProps) {
    return (
        <>
            {/* Bulk Delete Confirmation Dialog */}
            <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
                <AlertDialogContent className="dark:bg-gray-900">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="dark:text-gray-100">Delete Selected Banners</AlertDialogTitle>
                        <AlertDialogDescription className="dark:text-gray-400">
                            Are you sure you want to delete {selectedBanners.length} selected banner{selectedBanners.length !== 1 ? 's' : ''}?
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    
                    {selectedBanners.length > 0 && (
                        <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/20 rounded-md border border-red-200 dark:border-red-800">
                            <div className="text-sm font-medium text-red-800 dark:text-red-300 mb-2">Items to be deleted:</div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="text-red-700 dark:text-red-400">
                                    <span className="font-medium">Total:</span> {selectionStats.total || selectedBanners.length}
                                </div>
                                <div className="text-red-700 dark:text-red-400">
                                    <span className="font-medium">Active:</span> {selectionStats.active || 0}
                                </div>
                                <div className="text-red-700 dark:text-red-400">
                                    <span className="font-medium">Scheduled:</span> {selectionStats.scheduled || 0}
                                </div>
                                <div className="text-red-700 dark:text-red-400">
                                    <span className="font-medium">Expired:</span> {selectionStats.expired || 0}
                                </div>
                                <div className="text-red-700 dark:text-red-400">
                                    <span className="font-medium">Inactive:</span> {selectionStats.inactive || 0}
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPerformingBulkAction} className="dark:border-gray-600 dark:text-gray-300">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                handleBulkOperation();
                                setShowBulkDeleteDialog(false);
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white"
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

            {/* Bulk Status Update Dialog */}
            <AlertDialog open={showBulkStatusDialog} onOpenChange={setShowBulkStatusDialog}>
                <AlertDialogContent className="max-w-md dark:bg-gray-900">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="dark:text-gray-100">Bulk Update Status</AlertDialogTitle>
                        <AlertDialogDescription className="dark:text-gray-400">
                            Update status for {selectedBanners.length} selected banner{selectedBanners.length !== 1 ? 's' : ''}.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    
                    <div className="space-y-4 py-4">
                        <div>
                            <Label className="dark:text-gray-300">Status Action</Label>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                <Button
                                    variant="outline"
                                    className="dark:border-gray-600 dark:text-gray-300"
                                    onClick={() => {
                                        setBulkEditValue('active');
                                        handleBulkStatusUpdate();
                                        setShowBulkStatusDialog(false);
                                    }}
                                    disabled={isPerformingBulkAction}
                                >
                                    Activate
                                </Button>
                                <Button
                                    variant="outline"
                                    className="dark:border-gray-600 dark:text-gray-300"
                                    onClick={() => {
                                        setBulkEditValue('inactive');
                                        handleBulkStatusUpdate();
                                        setShowBulkStatusDialog(false);
                                    }}
                                    disabled={isPerformingBulkAction}
                                >
                                    Deactivate
                                </Button>
                                <Button
                                    variant="outline"
                                    className="dark:border-gray-600 dark:text-gray-300 col-span-2"
                                    onClick={() => {
                                        setBulkEditValue('scheduled');
                                        handleBulkStatusUpdate();
                                        setShowBulkStatusDialog(false);
                                    }}
                                    disabled={isPerformingBulkAction}
                                >
                                    Set as Scheduled
                                </Button>
                            </div>
                        </div>
                        
                        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-md border border-gray-200 dark:border-gray-700">
                            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current selection stats:</div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                <div className="text-gray-600 dark:text-gray-400">
                                    <span className="font-medium">Total:</span> {selectionStats.total || selectedBanners.length}
                                </div>
                                <div className="text-gray-600 dark:text-gray-400">
                                    <span className="font-medium">Active:</span> {selectionStats.active || 0}
                                </div>
                                <div className="text-gray-600 dark:text-gray-400">
                                    <span className="font-medium">Scheduled:</span> {selectionStats.scheduled || 0}
                                </div>
                                <div className="text-gray-600 dark:text-gray-400">
                                    <span className="font-medium">Expired:</span> {selectionStats.expired || 0}
                                </div>
                                <div className="text-gray-600 dark:text-gray-400">
                                    <span className="font-medium">Inactive:</span> {selectionStats.inactive || 0}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPerformingBulkAction} className="dark:border-gray-600 dark:text-gray-300">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => setShowBulkStatusDialog(false)}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            disabled={isPerformingBulkAction}
                        >
                            Done
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Bulk Audience Update Dialog */}
            <AlertDialog open={showBulkAudienceDialog} onOpenChange={setShowBulkAudienceDialog}>
                <AlertDialogContent className="max-w-md dark:bg-gray-900">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="dark:text-gray-100">Bulk Update Audience</AlertDialogTitle>
                        <AlertDialogDescription className="dark:text-gray-400">
                            Update target audience for {selectedBanners.length} selected banner{selectedBanners.length !== 1 ? 's' : ''}.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    
                    <div className="space-y-4 py-4">
                        <div>
                            <Label className="dark:text-gray-300">Target Audience</Label>
                            <div className="grid grid-cols-1 gap-2 mt-2">
                                <Button
                                    variant="outline"
                                    className="dark:border-gray-600 dark:text-gray-300"
                                    onClick={() => {
                                        setBulkEditValue('all');
                                        handleBulkAudienceUpdate();
                                        setShowBulkAudienceDialog(false);
                                    }}
                                    disabled={isPerformingBulkAction}
                                >
                                    All Users
                                </Button>
                                <Button
                                    variant="outline"
                                    className="dark:border-gray-600 dark:text-gray-300"
                                    onClick={() => {
                                        setBulkEditValue('residents');
                                        handleBulkAudienceUpdate();
                                        setShowBulkAudienceDialog(false);
                                    }}
                                    disabled={isPerformingBulkAction}
                                >
                                    All Residents
                                </Button>
                                <Button
                                    variant="outline"
                                    className="dark:border-gray-600 dark:text-gray-300"
                                    onClick={() => {
                                        setBulkEditValue('puroks');
                                        handleBulkAudienceUpdate();
                                        setShowBulkAudienceDialog(false);
                                    }}
                                    disabled={isPerformingBulkAction}
                                >
                                    Specific Puroks
                                </Button>
                            </div>
                        </div>
                    </div>
                    
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPerformingBulkAction} className="dark:border-gray-600 dark:text-gray-300">
                            Cancel
                        </AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}