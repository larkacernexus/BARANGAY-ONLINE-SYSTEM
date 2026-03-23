// forms-show/tabs/DetailsTab.tsx
import { ModernCard } from '@/components/residentui/modern-card';
import { Badge } from '@/components/ui/badge';
import { Folder, Building, Calendar, Tag, Info, FileText } from 'lucide-react';
import { Form } from '@/types/portal/forms/form.types';
import { formatDate, getFileTypeCategory, formatFileSize, getAgencyIcon } from '@/utils/portal/forms/form-utils';

interface DetailsTabProps {
    form: Form;
}

export function DetailsTab({ form }: DetailsTabProps) {
    const AgencyIcon = getAgencyIcon(form.issuing_agency);

    return (
        <>
            <ModernCard
                title="Form Information"
                icon={Info}
                iconColor="from-blue-500 to-indigo-500"
            >
                <div className="space-y-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                        <p className="text-xs text-gray-500 mb-1">Description</p>
                        <p className="text-sm whitespace-pre-wrap">
                            {form.description || 'No description provided.'}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                            <p className="text-xs text-gray-500">Category</p>
                            <div className="flex items-center gap-2 mt-1">
                                <Folder className="h-4 w-4 text-gray-400" />
                                <span className="font-medium">{form.category}</span>
                            </div>
                        </div>
                        <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                            <p className="text-xs text-gray-500">Issuing Agency</p>
                            <div className="flex items-center gap-2 mt-1">
                                <AgencyIcon className="h-4 w-4 text-gray-400" />
                                <span className="font-medium">{form.issuing_agency}</span>
                            </div>
                        </div>
                        <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                            <p className="text-xs text-gray-500">Language</p>
                            <p className="font-medium mt-1">{form.language || 'English'}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                            <p className="text-xs text-gray-500">Version</p>
                            <p className="font-medium mt-1">{form.version || 'Latest'}</p>
                        </div>
                    </div>

                    {form.tags && form.tags.length > 0 && (
                        <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                            <p className="text-xs text-gray-500 mb-2">Tags</p>
                            <div className="flex flex-wrap gap-2">
                                {form.tags.map((tag, index) => (
                                    <Badge key={index} variant="secondary" className="gap-1">
                                        <Tag className="h-3 w-3" />
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {form.valid_from && form.valid_until && (
                        <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                            <p className="text-xs text-gray-500 mb-2">Validity Period</p>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-500">Valid From</p>
                                    <div className="flex items-center gap-1 mt-1">
                                        <Calendar className="h-3 w-3 text-gray-400" />
                                        <span className="text-sm">{formatDate(form.valid_from)}</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Valid Until</p>
                                    <div className="flex items-center gap-1 mt-1">
                                        <Calendar className="h-3 w-3 text-gray-400" />
                                        <span className="text-sm">{formatDate(form.valid_until)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </ModernCard>

            <ModernCard
                title="File Information"
                icon={FileText}
                iconColor="from-purple-500 to-pink-500"
            >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                        <p className="text-xs text-gray-500">File Name</p>
                        <div className="flex items-center gap-2 mt-1">
                            <FileText className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-mono truncate">{form.file_name}</span>
                        </div>
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                        <p className="text-xs text-gray-500">File Type</p>
                        <p className="font-medium mt-1">{getFileTypeCategory(form.file_type)}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                        <p className="text-xs text-gray-500">File Size</p>
                        <p className="font-medium mt-1">{formatFileSize(form.file_size)}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                        <p className="text-xs text-gray-500">MIME Type</p>
                        <p className="text-sm font-mono mt-1">{form.mime_type || form.file_type}</p>
                    </div>
                </div>
            </ModernCard>
        </>
    );
}