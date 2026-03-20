// resources/js/Pages/Admin/Forms/components/form-metadata-sidebar.tsx
import React from 'react';
import { Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Eye,
    Download,
    Maximize2,
    Link as LinkIcon,
    Check,
    Printer,
    FileText,
    Copy,
    Edit,
    Trash2,
} from 'lucide-react';
import { route } from 'ziggy-js';
import { Form } from '../types';

interface Props {
    form: Form;
    copied: boolean;
    activeTab: string;
    setActiveTab: (tab: string) => void;
    onDownload: () => void;
    onFullscreen: () => void;
    onCopyLink: () => void;
    onCopyDetails: () => void;
    onPrint: () => void;
    onDelete: () => void;
    formatFileSize: (bytes: number) => string;
    formatDate: (date?: string) => string;
}

export const FormMetadataSidebar = ({
    form,
    copied,
    activeTab,
    setActiveTab,
    onDownload,
    onFullscreen,
    onCopyLink,
    onCopyDetails,
    onPrint,
    onDelete,
    formatFileSize,
    formatDate,
}: Props) => {
    return (
        <div className="space-y-6">
            {/* Status & Actions Card */}
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="text-sm dark:text-gray-100">Form Status & Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Availability</span>
                            <Badge variant={form.is_active ? "default" : "secondary"} className="dark:bg-gray-700 dark:text-gray-300">
                                {form.is_active ? 'Available' : 'Unavailable'}
                            </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Featured</span>
                            <Badge variant={form.is_featured ? "default" : "outline"} className={form.is_featured ? '' : 'dark:border-gray-600 dark:text-gray-300'}>
                                {form.is_featured ? 'Yes' : 'No'}
                            </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Views</span>
                            <div className="flex items-center gap-1">
                                <Eye className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                                <span className="font-medium dark:text-gray-300">{form.view_count}</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Downloads</span>
                            <div className="flex items-center gap-1">
                                <Download className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                                <span className="font-medium dark:text-gray-300">{form.download_count}</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">File Size</span>
                            <span className="font-medium dark:text-gray-300">{formatFileSize(form.file_size)}</span>
                        </div>
                    </div>
                    
                    <Separator className="dark:bg-gray-700" />
                    
                    <div className="space-y-2">
                        <Button
                            onClick={onDownload}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Download Form
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setActiveTab('preview')}
                            className="w-full dark:border-gray-600 dark:text-gray-300"
                        >
                            <Eye className="h-4 w-4 mr-2" />
                            Preview Form
                        </Button>
                        <Button
                            variant="outline"
                            onClick={onFullscreen}
                            className="w-full bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/50"
                        >
                            <Maximize2 className="h-4 w-4 mr-2" />
                            Fullscreen View
                        </Button>
                        <Button
                            variant="outline"
                            onClick={onCopyLink}
                            className="w-full dark:border-gray-600 dark:text-gray-300"
                        >
                            {copied ? (
                                <Check className="h-4 w-4 mr-2" />
                            ) : (
                                <LinkIcon className="h-4 w-4 mr-2" />
                            )}
                            {copied ? 'Link Copied!' : 'Copy Download Link'}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={onPrint}
                            className="w-full dark:border-gray-600 dark:text-gray-300"
                        >
                            <Printer className="h-4 w-4 mr-2" />
                            Print Details
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Metadata Card */}
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="text-sm dark:text-gray-100">Metadata</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Created</span>
                            <div className="text-right">
                                <span className="text-sm block dark:text-gray-300">{formatDate(form.created_at)}</span>
                                {form.created_by && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400 block">
                                        by {form.created_by.name}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Last Updated</span>
                            <span className="text-sm dark:text-gray-300">{formatDate(form.updated_at)}</span>
                        </div>
                        {form.valid_from && (
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Valid From</span>
                                <span className="text-sm dark:text-gray-300">{formatDate(form.valid_from)}</span>
                            </div>
                        )}
                        {form.valid_until && (
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Valid Until</span>
                                <span className="text-sm dark:text-gray-300">{formatDate(form.valid_until)}</span>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Share & Export Card */}
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="text-sm dark:text-gray-100">Share & Export</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onCopyLink}
                            className="flex-1 dark:border-gray-600 dark:text-gray-300"
                        >
                            <Copy className="h-3 w-3 mr-1" />
                            Copy Link
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onCopyDetails}
                            className="flex-1 dark:border-gray-600 dark:text-gray-300"
                        >
                            <FileText className="h-3 w-3 mr-1" />
                            Copy Details
                        </Button>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onPrint}
                            className="flex-1 dark:border-gray-600 dark:text-gray-300"
                        >
                            <Printer className="h-3 w-3 mr-1" />
                            Print
                        </Button>
                        <Link href={route('admin.forms.edit', form.id)}>
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 dark:border-gray-600 dark:text-gray-300"
                            >
                                <Edit className="h-3 w-3 mr-1" />
                                Edit
                            </Button>
                        </Link>
                    </div>
                    <div className="pt-2 border-t dark:border-gray-700">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onDelete}
                            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/50"
                        >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete Form
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};