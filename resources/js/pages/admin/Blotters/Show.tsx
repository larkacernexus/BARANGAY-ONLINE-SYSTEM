// resources/js/Pages/Admin/Blotters/Show.tsx

import AppLayout from '@/layouts/admin-app-layout';
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
import { router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import axios from 'axios';

// Import components
import { BlotterHeader } from '@/components/admin/blotters/show/components/blotter-header';
import { BlotterTabs } from '@/components/admin/blotters/show/components/blotter-tabs';
import { BlotterBanner } from '@/components/admin/blotters/show/components/blotter-banner';

// Import types
import { Blotter, Attachment } from '@/components/admin/blotters/show/types';

interface Props {
    blotter: Blotter;
}

export default function BlotterShow({ blotter }: Props) {
    const [copied, setCopied] = useState(false);
    const [numberCopied, setNumberCopied] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [isLoadingAttachments, setIsLoadingAttachments] = useState(false);

    // Safely get arrays
    const involvedResidents = blotter.involved_residents || [];

    // Fetch attachments with URLs
    useEffect(() => {
        const fetchAttachments = async () => {
            if (!blotter.attachments || blotter.attachments.length === 0) {
                setAttachments([]);
                return;
            }

            setIsLoadingAttachments(true);
            try {
                const attachmentsWithUrls = await Promise.all(
                    blotter.attachments.map(async (attachment, index) => {
                        try {
                            const response = await axios.get(`/admin/blotters/${blotter.id}/attachment-url/${index}`);
                            return {
                                ...attachment,
                                url: response.data.url,
                                preview: attachment.type.startsWith('image/') ? response.data.url : undefined
                            };
                        } catch (error) {
                            return attachment;
                        }
                    })
                );
                setAttachments(attachmentsWithUrls);
            } catch (error) {
                console.error('Error fetching attachment URLs:', error);
                setAttachments(blotter.attachments);
            } finally {
                setIsLoadingAttachments(false);
            }
        };

        fetchAttachments();
    }, [blotter.id, blotter.attachments]);

    const copyToClipboard = (text: string, type: 'link' | 'number') => {
        navigator.clipboard.writeText(text);
        if (type === 'link') {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } else {
            setNumberCopied(true);
            setTimeout(() => setNumberCopied(false), 2000);
        }
    };

    const handleCopyLink = () => {
        const link = window.location.href;
        copyToClipboard(link, 'link');
    };

    const handleCopyNumber = () => {
        copyToClipboard(blotter.blotter_number, 'number');
    };

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(`/admin/blotters/${blotter.id}`, {
            onFinish: () => {
                setIsDeleting(false);
                setShowDeleteDialog(false);
            },
        });
    };

    const handlePrint = () => {
        window.print();
    };

    const handleExport = () => {
        const data = {
            blotter: {
                ...blotter,
                attachments: attachments.map(a => ({ name: a.name, size: a.size, type: a.type })),
                involved_residents: involvedResidents
            }
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `blotter-${blotter.blotter_number}.json`;
        a.click();
    };

    const handleDownload = async (attachment: Attachment, index: number) => {
        try {
            const response = await axios.get(`/admin/blotters/${blotter.id}/download-attachment/${index}`, {
                responseType: 'blob'
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', attachment.name);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading attachment:', error);
            if (attachment.url) {
                window.open(attachment.url, '_blank');
            }
        }
    };

    const hasActionTaken = !!blotter.action_taken;

    return (
        <>
            <AppLayout
                title={`Blotter #${blotter.blotter_number}`}
                breadcrumbs={[
                    { title: 'Dashboard', href: '/dashboard' },
                    { title: 'Blotters', href: '/admin/blotters' },
                    { title: `Blotter #${blotter.blotter_number}`, href: `/admin/blotters/${blotter.id}` }
                ]}
            >
                <TooltipProvider>
                    <div className="space-y-6">
                        {/* Header with Actions */}
                        <BlotterHeader
                            blotter={blotter}
                            copied={copied}
                            numberCopied={numberCopied}
                            onCopyLink={handleCopyLink}
                            onCopyNumber={handleCopyNumber}
                            onEdit={() => router.visit(`/admin/blotters/${blotter.id}/edit`)}
                            onDelete={() => setShowDeleteDialog(true)}
                            onPrint={handlePrint}
                            onExport={handleExport}
                        />

                        {/* Status Banner */}
                        {blotter.status === 'pending' && (
                            <BlotterBanner blotter={blotter} />
                        )}

                        {/* Tabs Component */}
                        <BlotterTabs
                            activeTab={activeTab}
                            onTabChange={setActiveTab}
                            blotter={blotter}
                            attachments={attachments}
                            involvedResidents={involvedResidents}
                            isLoadingAttachments={isLoadingAttachments}
                            hasActionTaken={hasActionTaken}
                            onDownload={handleDownload}
                        />
                    </div>

                    {/* Delete Confirmation Dialog */}
                    <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                        <AlertDialogContent className="dark:bg-gray-900">
                            <AlertDialogHeader>
                                <AlertDialogTitle className="dark:text-gray-100">Delete Blotter Record</AlertDialogTitle>
                                <AlertDialogDescription className="dark:text-gray-400">
                                    Are you sure you want to delete blotter record #{blotter.blotter_number}? 
                                    This action cannot be undone and will permanently remove all associated data.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel disabled={isDeleting} className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                                    Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleDelete}
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Deleting...
                                        </>
                                    ) : (
                                        'Delete Blotter'
                                    )}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </TooltipProvider>
            </AppLayout>
        </>
    );
}