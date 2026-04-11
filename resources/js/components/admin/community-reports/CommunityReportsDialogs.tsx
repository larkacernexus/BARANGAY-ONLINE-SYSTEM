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
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { BulkOperation } from '@/types/admin/reports/communityReportTypes';
import { Loader2 } from 'lucide-react';

interface SelectionStats {
    total: number;
    pending: number;
    under_review: number;
    assigned: number;
    in_progress: number;
    resolved: number;
    rejected: number;
    critical: number;
    high_priority: number;
    medium_priority: number;
    low_priority: number;
    high_urgency: number;
    anonymous: number;
    withEvidence: number;
    assignedCount: number;
    safetyConcern: number;
    environmentalImpact: number;
    recurringIssue: number;
    communityImpact: number;
    totalEstimatedAffected: number;
}

interface CommunityReportsDialogsProps {
    showBulkDeleteDialog: boolean;
    setShowBulkDeleteDialog: (show: boolean) => void;
    showBulkStatusDialog: boolean;
    setShowBulkStatusDialog: (show: boolean) => void;
    showBulkPriorityDialog: boolean;
    setShowBulkPriorityDialog: (show: boolean) => void;
    showBulkAssignDialog: boolean;
    setShowBulkAssignDialog: (show: boolean) => void;
    isPerformingBulkAction: boolean;
    selectedReports: number[];
    handleBulkOperation: (operation: BulkOperation, customData?: any) => Promise<void>;
    selectionStats: SelectionStats;
    bulkEditValue: string;
    setBulkEditValue: (value: string) => void;
    safeStatuses: Record<string, string>;
    safePriorities: Record<string, string>;
    safeStaff: Array<{id: number, name: string}>;
}

export default function CommunityReportsDialogs({
    showBulkDeleteDialog,
    setShowBulkDeleteDialog,
    showBulkStatusDialog,
    setShowBulkStatusDialog,
    showBulkPriorityDialog,
    setShowBulkPriorityDialog,
    showBulkAssignDialog,
    setShowBulkAssignDialog,
    isPerformingBulkAction,
    selectedReports,
    handleBulkOperation,
    selectionStats,
    bulkEditValue,
    setBulkEditValue,
    safeStatuses,
    safePriorities,
    safeStaff
}: CommunityReportsDialogsProps) {
    
    return (
        <>
            {/* Bulk Delete Confirmation Dialog */}
            <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Selected Reports</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {selectedReports.length} selected report{selectedReports.length !== 1 ? 's' : ''}?
                            This action cannot be undone. Resolved or rejected reports cannot be deleted.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPerformingBulkAction}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => handleBulkOperation('delete')}
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
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Bulk Update Status</AlertDialogTitle>
                        <AlertDialogDescription>
                            Update status for {selectedReports.length} selected reports.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label>New Status</Label>
                            <select 
                                className="w-full border rounded px-3 py-2 mt-1"
                                value={bulkEditValue}
                                onChange={(e) => setBulkEditValue(e.target.value)}
                            >
                                <option value="">Select Status</option>
                                {Object.entries(safeStatuses).map(([value, label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded">
                            <div className="font-medium mb-1">Current selection stats:</div>
                            <ul className="list-disc list-inside space-y-1">
                                <li>{selectionStats.total} total reports</li>
                                <li>{selectionStats.pending} pending</li>
                                <li>{selectionStats.under_review} under review</li>
                                <li>{selectionStats.assigned} assigned</li>
                                <li>{selectionStats.in_progress} in progress</li>
                                <li>{selectionStats.resolved} resolved</li>
                                <li>{selectionStats.rejected} rejected</li>
                                <li>{selectionStats.critical} critical priority</li>
                                <li>{selectionStats.high_priority} high priority</li>
                                <li>{selectionStats.high_urgency} high urgency</li>
                                <li>{selectionStats.anonymous} anonymous</li>
                                <li>{selectionStats.withEvidence} with evidence</li>
                                <li>{selectionStats.safetyConcern} safety concerns</li>
                                <li>{selectionStats.environmentalImpact} environmental impact</li>
                                <li>{selectionStats.recurringIssue} recurring issues</li>
                                <li>{selectionStats.communityImpact} community impact</li>
                            </ul>
                        </div>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPerformingBulkAction}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => handleBulkOperation('update_status')}
                            disabled={isPerformingBulkAction || !bulkEditValue}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {isPerformingBulkAction ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                'Update Status'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Bulk Priority Update Dialog */}
            <AlertDialog open={showBulkPriorityDialog} onOpenChange={setShowBulkPriorityDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Bulk Update Priority</AlertDialogTitle>
                        <AlertDialogDescription>
                            Update priority for {selectedReports.length} selected reports.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label>New Priority</Label>
                            <select 
                                className="w-full border rounded px-3 py-2 mt-1"
                                value={bulkEditValue}
                                onChange={(e) => setBulkEditValue(e.target.value)}
                            >
                                <option value="">Select Priority</option>
                                {Object.entries(safePriorities).map(([value, label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded">
                            <div className="font-medium mb-1">Current priority distribution:</div>
                            <ul className="list-disc list-inside space-y-1">
                                <li>{selectionStats.critical} critical</li>
                                <li>{selectionStats.high_priority} high</li>
                                <li>{selectionStats.medium_priority} medium</li>
                                <li>{selectionStats.low_priority} low</li>
                            </ul>
                        </div>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPerformingBulkAction}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => handleBulkOperation('update_priority')}
                            disabled={isPerformingBulkAction || !bulkEditValue}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {isPerformingBulkAction ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                'Update Priority'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Bulk Assign Dialog */}
            <AlertDialog open={showBulkAssignDialog} onOpenChange={setShowBulkAssignDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Bulk Assign Reports</AlertDialogTitle>
                        <AlertDialogDescription>
                            Assign {selectedReports.length} selected reports to staff member.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label>Assign To</Label>
                            <select 
                                className="w-full border rounded px-3 py-2 mt-1"
                                value={bulkEditValue}
                                onChange={(e) => setBulkEditValue(e.target.value)}
                            >
                                <option value="">Select Staff Member</option>
                                <option value="unassigned">Unassign</option>
                                {safeStaff.map((person) => (
                                    <option key={person.id} value={person.id}>
                                        {person.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded">
                            <div className="font-medium mb-1">Current assignment:</div>
                            <ul className="list-disc list-inside space-y-1">
                                <li>{selectionStats.assignedCount} assigned</li>
                                <li>{selectionStats.total - selectionStats.assignedCount} unassigned</li>
                                <li>{selectionStats.safetyConcern} safety concerns</li>
                                <li>{selectionStats.withEvidence} have evidence</li>
                                <li>{selectionStats.communityImpact} community impact</li>
                            </ul>
                        </div>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPerformingBulkAction}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => handleBulkOperation('assign_to')}
                            disabled={isPerformingBulkAction || !bulkEditValue}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {isPerformingBulkAction ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Assigning...
                                </>
                            ) : (
                                'Assign Reports'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}