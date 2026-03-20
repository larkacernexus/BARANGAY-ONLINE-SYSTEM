// resources/js/Pages/Admin/Forms/components/form-details-card.tsx
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    FileText,
    Download,
    PackageOpen,
    Shield,
    Tag,
    FileCode,
} from 'lucide-react';
import { Form } from '../types';

interface Props {
    form: Form;
    onDownload: () => void;
    getFileIcon: (fileType?: string) => string;
    getFileTypeIcon: (fileType?: string) => React.ReactNode;
    getCategoryColor: (category?: string) => string;
    getAgencyIcon: (agency?: string) => React.ReactNode;
    formatFileSize: (bytes: number) => string;
}

export const FormDetailsCard = ({
    form,
    onDownload,
    getFileIcon,
    getFileTypeIcon,
    getCategoryColor,
    getAgencyIcon,
    formatFileSize,
}: Props) => {
    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <FileText className="h-5 w-5" />
                    Form Information
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                    Complete details about this form
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Description */}
                <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</h3>
                    <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">{form.description}</p>
                </div>

                <Separator className="dark:bg-gray-700" />

                {/* File Information */}
                <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">File Information</h3>
                    <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                        <div className="text-3xl">
                            {getFileIcon(form.file_type)}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium dark:text-gray-100">{form.file_name}</h4>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        {getFileTypeIcon(form.file_type)}
                                        <span>{formatFileSize(form.file_size)}</span>
                                        <span>•</span>
                                        <span>{form.file_type}</span>
                                        <span>•</span>
                                        <span>MIME: {form.mime_type}</span>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={onDownload}
                                    className="dark:border-gray-600 dark:text-gray-300"
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Download
                                </Button>
                            </div>
                            <div className="mt-4 grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">File Path</p>
                                    <p className="text-sm truncate dark:text-gray-300" title={form.file_path}>
                                        {form.file_path}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Security</p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {form.is_public ? (
                                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
                                                <PackageOpen className="h-3 w-3 mr-1" />
                                                Public
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800">
                                                <Shield className="h-3 w-3 mr-1" />
                                                Restricted
                                            </Badge>
                                        )}
                                        {form.requires_login && (
                                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800">
                                                <Shield className="h-3 w-3 mr-1" />
                                                Login Required
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <Separator className="dark:bg-gray-700" />

                {/* Category & Agency */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</h3>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className={getCategoryColor(form.category)}>
                                {form.category}
                            </Badge>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Issuing Agency</h3>
                        <div className="flex items-center gap-2 dark:text-gray-300">
                            {getAgencyIcon(form.issuing_agency)}
                            <span>{form.issuing_agency}</span>
                        </div>
                    </div>
                </div>

                {/* Additional Information */}
                {(form.version || form.language || form.pages || (form.tags && form.tags.length > 0)) && (
                    <>
                        <Separator className="dark:bg-gray-700" />
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Additional Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {form.version && (
                                    <div className="space-y-1">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Version</p>
                                        <div className="flex items-center gap-2">
                                            <FileCode className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                            <span className="text-sm dark:text-gray-300">{form.version}</span>
                                        </div>
                                    </div>
                                )}
                                {form.language && (
                                    <div className="space-y-1">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Language</p>
                                        <span className="text-sm dark:text-gray-300">{form.language}</span>
                                    </div>
                                )}
                                {form.pages && (
                                    <div className="space-y-1">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Pages</p>
                                        <span className="text-sm dark:text-gray-300">{form.pages} pages</span>
                                    </div>
                                )}
                            </div>
                            {form.tags && form.tags.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Tags</p>
                                    <div className="flex flex-wrap gap-1">
                                        {form.tags.map((tag, index) => (
                                            <Badge key={index} variant="secondary" className="text-xs dark:bg-gray-700 dark:text-gray-300">
                                                <Tag className="h-2 w-2 mr-1" />
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
};