// resources/js/Pages/Admin/Positions/Show.tsx
import AppLayout from '@/layouts/admin-app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import {
    TooltipProvider,
} from '@/components/ui/tooltip';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    AlertTriangle,
    Trash2,
    RefreshCw,
} from 'lucide-react';

// Import components
import { PositionHeader } from '@/components/admin/positions/show/components/position-header';
import { StatusBanner } from '@/components/admin/positions/show/components/status-banner';
import { PositionTabs } from '@/components/admin/positions/show/components/position-tabs';
import { DangerZone } from '@/components/admin/positions/show/components/danger-zone';

// Import types and utilities
import { Position } from '@/types/admin/positions/position.types';
import { formatDateTime } from '@/components/admin/positions/show/utils/helpers';

interface PositionShowProps {
    position: Position;
}

export default function PositionShow({ position }: PositionShowProps) {
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState('details');
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDelete = () => {
        const hasOfficials = (position.officials_count ?? 0) > 0;
        
        if (hasOfficials) {
            alert('Cannot delete position with assigned officials. Please reassign or remove officials first.');
            return;
        }
        
        setIsDeleting(true);
        router.delete(`/admin/positions/${position.id}`, {
            onFinish: () => setIsDeleting(false),
            onSuccess: () => {
                setShowDeleteDialog(false);
            },
        });
    };

    const handleCopyLink = () => {
        const link = window.location.href;
        navigator.clipboard.writeText(link).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const isKagawadPosition = position.name?.toLowerCase().includes('kagawad') || 
                              position.code?.toLowerCase().includes('kagawad');

    const isCaptainPosition = position.name?.toLowerCase().includes('captain') || 
                              position.code?.toLowerCase().includes('captain') ||
                              position.name?.toLowerCase().includes('kapitan');

    // Check if position has committee assigned
    const hasCommittees = position.committee !== null && position.committee !== undefined;

    const hasOfficials = (position.officials_count ?? 0) > 0;

    return (
        <AppLayout
            title={position.name}
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Positions', href: '/admin/positions' },
                { title: position.name, href: `/admin/positions/${position.id}` }
            ]}
        >
            <TooltipProvider>
                <div className="space-y-6">
                    {/* Header with Actions */}
                    <PositionHeader
                        position={position}
                        copied={copied}
                        isCaptainPosition={isCaptainPosition}
                        isKagawadPosition={isKagawadPosition}
                        onCopyLink={handleCopyLink}
                        onCopyCode={() => copyToClipboard(position.code)}
                        onDelete={() => setShowDeleteDialog(true)}
                        canDelete={!hasOfficials}
                    />

                    {/* Status Banner - Show warning for positions without committee */}
                    {!hasCommittees && (
                        <StatusBanner position={position} />
                    )}

                    {/* Tab Navigation */}
                    <PositionTabs
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        position={position}
                        hasCommittees={hasCommittees}
                    />

                    {/* Tab Content */}
                    <div className="pt-2">
                        <PositionTabs.Content
                            activeTab={activeTab}
                            position={position}
                            copied={copied}
                            isCaptainPosition={isCaptainPosition}
                            isKagawadPosition={isKagawadPosition}
                            onCopyCode={() => copyToClipboard(position.code)}
                            formatDateTime={formatDateTime}
                        />
                    </div>

                    {/* Danger Zone */}
                    <DangerZone
                        position={position}
                        onDelete={() => setShowDeleteDialog(true)}
                    />
                </div>

                {/* Delete Confirmation Dialog */}
                <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <AlertDialogContent className="dark:bg-gray-900">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="dark:text-gray-100">Delete Position</AlertDialogTitle>
                            <AlertDialogDescription className="dark:text-gray-400">
                                Are you sure you want to delete the position "{position.name}"? This action cannot be undone.
                                {hasOfficials && (
                                    <div className="mt-2 p-2 bg-red-50 dark:bg-red-950/20 rounded-md text-red-600 dark:text-red-400">
                                        This position has {position.officials_count} assigned official(s). Please reassign or remove them first.
                                    </div>
                                )}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel 
                                disabled={isDeleting} 
                                className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDelete}
                                className="bg-red-600 hover:bg-red-700 text-white"
                                disabled={isDeleting || hasOfficials}
                            >
                                {isDeleting ? (
                                    <>
                                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    'Delete Position'
                                )}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </TooltipProvider>
        </AppLayout>
    );
}