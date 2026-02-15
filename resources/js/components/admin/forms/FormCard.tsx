import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ActionDropdown, ActionDropdownItem, ActionDropdownSeparator } from '@/components/adminui/action-dropdown';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { 
    FileText, Building, Calendar, User, DownloadIcon, Eye, 
    Edit, Trash2, PlayCircle, PauseCircle, CheckCircle, XCircle
} from 'lucide-react';
import { Form } from '@/types';

interface FormCardProps {
    form: Form;
    isSelected: boolean;
    isBulkMode: boolean;
    isMobile: boolean;
    onSelect: (id: number) => void;
    onDelete: (form: Form) => void;
    onToggleStatus: (form: Form) => void;
    onDownload: (form: Form) => void;
    truncateText: (text: string, maxLength: number) => string;
    formatFileSize: (bytes: number) => string;
    getCategoryColor: (category: string) => string;
    formatDateTime: (dateString: string) => string;
}

export function FormCard({
    form,
    isSelected,
    isBulkMode,
    isMobile,
    onSelect,
    onDelete,
    onToggleStatus,
    onDownload,
    truncateText,
    formatFileSize,
    getCategoryColor,
    formatDateTime
}: FormCardProps) {
    return (
        <Card 
            className={`overflow-hidden transition-all hover:shadow-md ${
                isSelected ? 'border-blue-500 border-2 bg-blue-50 dark:bg-blue-900/10' : ''
            } ${!form.is_active ? 'opacity-60' : ''}`}
            onClick={(e) => {
                if (isBulkMode && e.target instanceof HTMLElement && 
                    !e.target.closest('a') && 
                    !e.target.closest('button') &&
                    !e.target.closest('.dropdown-menu-content')) {
                    onSelect(form.id);
                }
            }}
        >
            <CardContent className="p-4">
                {/* Card Header */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                            <FileText className="h-5 w-5 text-gray-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="font-medium truncate flex items-center gap-1">
                                {truncateText(form.title || 'Untitled', isMobile ? 20 : 30)}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                                ID: {form.id}
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                        {isBulkMode && (
                            <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => onSelect(form.id)}
                                onClick={(e) => e.stopPropagation()}
                                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                            />
                        )}
                        <ActionDropdown>
                            <ActionDropdownItem
                                icon={<Eye className="h-4 w-4" />}
                                href={route('forms.show', form.id)}
                            >
                                View Details
                            </ActionDropdownItem>
                            
                            <ActionDropdownItem
                                icon={<Edit className="h-4 w-4" />}
                                href={route('forms.edit', form.id)}
                            >
                                Edit Form
                            </ActionDropdownItem>
                            
                            <ActionDropdownItem
                                icon={<DownloadIcon className="h-4 w-4" />}
                                onClick={() => onDownload(form)}
                            >
                                Download
                            </ActionDropdownItem>
                            
                            <ActionDropdownItem
                                icon={form.is_active ? <PauseCircle className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
                                onClick={() => onToggleStatus(form)}
                            >
                                {form.is_active ? 'Deactivate' : 'Activate'}
                            </ActionDropdownItem>
                            
                            <ActionDropdownSeparator />
                            
                            <ActionDropdownItem
                                icon={<Trash2 className="h-4 w-4" />}
                                onClick={() => onDelete(form)}
                                dangerous
                            >
                                Delete Form
                            </ActionDropdownItem>
                        </ActionDropdown>
                    </div>
                </div>

                {/* Card Content */}
                <div className="space-y-3">
                    {/* Description */}
                    <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {truncateText(form.description || 'No description', 80)}
                    </div>

                    {/* Category */}
                    <div>
                        <Badge 
                            className={getCategoryColor(form.category || 'Other')}
                        >
                            {form.category || 'Uncategorized'}
                        </Badge>
                    </div>

                    {/* Agency */}
                    <div className="flex items-center gap-2 text-sm">
                        <Building className="h-3 w-3 text-gray-500 flex-shrink-0" />
                        <div className="truncate text-gray-700">
                            {truncateText(form.issuing_agency || 'Unknown', 25)}
                        </div>
                    </div>

                    {/* File Info */}
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                            <FileText className="h-3 w-3 text-gray-500" />
                            <div className="truncate text-gray-700 max-w-[60%]">
                                {truncateText(form.file_name || 'Unknown', 15)}
                            </div>
                        </div>
                        <div className="text-xs text-gray-500">
                            {formatFileSize(form.file_size || 0)}
                        </div>
                    </div>

                    {/* Downloads & Date */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                        <div className="text-sm">
                            <div className="font-medium text-gray-900 dark:text-white">
                                {(form.download_count || 0).toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500">downloads</div>
                        </div>
                        
                        <div className="text-right">
                            <div className="text-xs text-gray-500">
                                {formatDateTime(form.created_at)}
                            </div>
                            {form.created_by?.name && (
                                <div className="text-xs text-gray-400 truncate max-w-[100px]">
                                    by {form.created_by.name}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Status & Action */}
                    <div className="flex items-center justify-between pt-2">
                        <Badge 
                            variant={form.is_active ? "default" : "secondary"}
                            className="flex items-center gap-1 text-xs"
                        >
                            {form.is_active ? (
                                <CheckCircle className="h-3 w-3" />
                            ) : (
                                <XCircle className="h-3 w-3" />
                            )}
                            {form.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        
                        <Button
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => onDownload(form)}
                        >
                            <DownloadIcon className="h-3 w-3 mr-1" />
                            Download
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}