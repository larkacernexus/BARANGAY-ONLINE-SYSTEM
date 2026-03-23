// components/document/desktop/desktop-details.tsx
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ModernCard } from '@/components/residentui/modern-card';
import { Copy, Calendar, Clock, Tag, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate, formatDateTime } from '@/components/residentui/lib/resident-ui-utils';
import { getDocumentStatus } from '@/utils/portal/records/document.utils';
import { Document } from '@/types/portal/records/document.types';

interface DesktopDetailsProps {
    document: Document;
}

export function DesktopDetails({ document }: DesktopDetailsProps) {
    const status = getDocumentStatus(document);

    // Helper function to get weekday
    const getWeekday = (dateString: string | null | undefined) => {
        if (!dateString) return '';
        try {
            return new Date(dateString).toLocaleDateString('en-PH', { weekday: 'long' });
        } catch {
            return '';
        }
    };

    return (
        <ModernCard title="Document Information" icon={Info} iconColor="from-purple-500 to-pink-500">
            <div className="space-y-6">
                {/* Reference Number */}
                <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">
                        Reference Number
                    </label>
                    <div className="flex items-center gap-2">
                        <code className="flex-1 font-mono text-sm bg-gray-50 dark:bg-gray-900 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800">
                            {document.reference_number || 'N/A'}
                        </code>
                        {document.reference_number && (
                            <Button variant="outline" size="icon" onClick={() => navigator.clipboard.writeText(document.reference_number!)} className="rounded-xl">
                                <Copy className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Owner */}
                <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">
                        Document Owner
                    </label>
                    <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                        <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 text-lg">
                                {document.resident?.first_name?.[0]}{document.resident?.last_name?.[0]}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                                {document.resident ? `${document.resident.first_name} ${document.resident.last_name}` : 'Unknown Resident'}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Resident</p>
                        </div>
                    </div>
                </div>

                {/* Dates Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {document.issue_date && (
                        <div>
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">
                                Issue Date
                            </label>
                            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                                <Calendar className="h-5 w-5 text-gray-400" />
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {formatDate(document.issue_date, 'MMMM D, YYYY')}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {getWeekday(document.issue_date)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {document.expiry_date && (
                        <div>
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">
                                Expiry Date
                            </label>
                            <div className={cn("flex items-center gap-3 p-4 rounded-xl", status === 'expired' ? 'bg-rose-50 dark:bg-rose-950/30' : 'bg-gray-50 dark:bg-gray-900')}>
                                <Clock className="h-5 w-5 text-gray-400" />
                                <div>
                                    <p className={cn("font-medium", status === 'expired' && "text-rose-600 dark:text-rose-400")}>
                                        {formatDate(document.expiry_date, 'MMMM D, YYYY')}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {getWeekday(document.expiry_date)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Upload Info */}
                <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">
                        Upload Information
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Uploaded</p>
                            <p className="font-medium">{formatDateTime(document.created_at)}</p>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Last Modified</p>
                            <p className="font-medium">{formatDateTime(document.updated_at)}</p>
                        </div>
                        {document.uploaded_by_user && (
                            <div className="col-span-2 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Uploaded By</p>
                                <p className="font-medium">{document.uploaded_by_user.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{document.uploaded_by_user.email}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tags */}
                {document.tags && document.tags.length > 0 && (
                    <div>
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">
                            Tags
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {document.tags.map((tag, index) => (
                                <Badge key={index} variant="secondary" className="gap-1 px-3 py-1.5">
                                    <Tag className="h-3 w-3" />
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </ModernCard>
    );
}