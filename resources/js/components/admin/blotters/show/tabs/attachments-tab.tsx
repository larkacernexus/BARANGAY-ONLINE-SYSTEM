// resources/js/components/admin/blotters/show/components/tabs/attachments-tab.tsx

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { Download, Grid, List, Edit, Loader2, FileText, Eye } from 'lucide-react';
import { useState } from 'react';
import { Attachment } from '@/components/admin/blotters/show/types';
import { AttachmentCard } from '@/components/admin/blotters/show/cards/attachment-card';
import { formatFileSize } from '@/components/admin/blotters/show/utils/helpers';

interface AttachmentsTabProps {
    attachments: Attachment[];
    isLoading: boolean;
    onDownload: (attachment: Attachment, index: number) => void;
    blotterId: number;
}

export function AttachmentsTab({ attachments, isLoading, onDownload, blotterId }: AttachmentsTabProps) {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const hasAttachments = attachments.length > 0;

    const handleDownloadAll = () => {
        attachments.forEach((attachment, index) => {
            onDownload(attachment, index);
        });
    };

    const totalSize = attachments.reduce((sum, a) => sum + a.size, 0);

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                            <Download className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            Attachments ({attachments.length})
                        </CardTitle>
                        <CardDescription className="dark:text-gray-400">
                            Files and documents related to this blotter
                        </CardDescription>
                    </div>
                    {hasAttachments && (
                        <div className="flex items-center gap-2">
                            <div className="flex items-center border rounded-lg dark:border-gray-700">
                                <Button
                                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setViewMode('grid')}
                                    className="rounded-r-none"
                                >
                                    <Grid className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setViewMode('list')}
                                    className="rounded-l-none"
                                >
                                    <List className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                ) : hasAttachments ? (
                    viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {attachments.map((attachment, index) => (
                                <AttachmentCard
                                    key={index}
                                    attachment={attachment}
                                    onDownload={() => onDownload(attachment, index)}
                                    onView={() => attachment.preview && window.open(attachment.preview, '_blank')}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {attachments.map((attachment, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                                            <FileText className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium truncate dark:text-gray-300">{attachment.name}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {formatFileSize(attachment.size)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {attachment.type.startsWith('image/') && attachment.preview && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => window.open(attachment.preview, '_blank')}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onDownload(attachment, index)}
                                        >
                                            <Download className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                ) : (
                    <div className="text-center py-12 space-y-4">
                        <FileText className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600" />
                        <div>
                            <h4 className="font-medium text-gray-700 dark:text-gray-300">No attachments</h4>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                                No files have been attached to this blotter
                            </p>
                        </div>
                        <Link href={`/admin/blotters/${blotterId}/edit`}>
                            <Button variant="outline" className="dark:border-gray-600 dark:text-gray-300">
                                <Edit className="h-4 w-4 mr-2" />
                                Add Attachments
                            </Button>
                        </Link>
                    </div>
                )}
            </CardContent>
            {hasAttachments && (
                <CardFooter className="border-t dark:border-gray-700 pt-4">
                    <div className="flex justify-between items-center w-full text-sm text-gray-500 dark:text-gray-400">
                        <span>Total size: {formatFileSize(totalSize)}</span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleDownloadAll}
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Download All
                        </Button>
                    </div>
                </CardFooter>
            )}
        </Card>
    );
}