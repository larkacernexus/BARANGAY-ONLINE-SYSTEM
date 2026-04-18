// components/admin/document-types/create/specs-tab.tsx
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Plus, X, FileCode, CheckCircle, HardDrive } from 'lucide-react';

interface SpecsTabProps {
    formData: any;
    errors: Record<string, string>;
    commonFormats: Record<string, string>;
    selectedFormats: string[];
    showCustomFormatInput: boolean;
    customFormat: string;
    fileSizeUnit: 'KB' | 'MB';
    fileSizeValue: number;
    onToggleFormat: (format: string) => void;
    onAddCustomFormat: () => void;
    onRemoveFormat: (format: string) => void;
    onShowCustomFormatInputChange: (show: boolean) => void;
    onCustomFormatChange: (value: string) => void;
    onFileSizeUnitChange: (unit: 'KB' | 'MB') => void;
    onFileSizeValueChange: (value: number) => void;
    formatFileSize: (bytes: number) => string;
    isSubmitting: boolean;
    isEdit?: boolean;
}

export function SpecsTab({
    formData,
    errors,
    commonFormats,
    selectedFormats,
    showCustomFormatInput,
    customFormat,
    fileSizeUnit,
    fileSizeValue,
    onToggleFormat,
    onAddCustomFormat,
    onRemoveFormat,
    onShowCustomFormatInputChange,
    onCustomFormatChange,
    onFileSizeUnitChange,
    onFileSizeValueChange,
    formatFileSize,
    isSubmitting,
    isEdit = false
}: SpecsTabProps) {
    return (
        <div className="space-y-6">
            {/* Accepted Formats */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label className="dark:text-gray-300">Accepted File Formats</Label>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onShowCustomFormatInputChange(true)}
                        disabled={showCustomFormatInput || isSubmitting}
                        className="dark:border-gray-600 dark:text-gray-300"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Custom Format
                    </Button>
                </div>

                {/* Common Formats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {Object.entries(commonFormats).map(([format, label]) => (
                        <Button
                            key={format}
                            type="button"
                            variant={selectedFormats.includes(format) ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => onToggleFormat(format)}
                            disabled={isSubmitting}
                            className={`justify-start ${
                                selectedFormats.includes(format) 
                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white dark:from-blue-700 dark:to-indigo-700' 
                                    : 'dark:border-gray-600 dark:text-gray-300'
                            }`}
                        >
                            <FileCode className="h-4 w-4 mr-2" />
                            {label}
                            {selectedFormats.includes(format) && (
                                <CheckCircle className="h-4 w-4 ml-auto" />
                            )}
                        </Button>
                    ))}
                </div>

                {/* Custom Format Input */}
                {showCustomFormatInput && (
                    <div className="flex gap-2">
                        <Input
                            value={customFormat}
                            onChange={(e) => onCustomFormatChange(e.target.value)}
                            placeholder="Enter format (e.g., psd, ai)"
                            className="flex-1 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                            disabled={isSubmitting}
                        />
                        <Button
                            type="button"
                            variant="default"
                            size="sm"
                            onClick={onAddCustomFormat}
                            disabled={!customFormat.trim() || isSubmitting}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white dark:from-blue-700 dark:to-indigo-700"
                        >
                            Add
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                onShowCustomFormatInputChange(false);
                                onCustomFormatChange('');
                            }}
                            disabled={isSubmitting}
                            className="dark:text-gray-400 dark:hover:text-white"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                )}

                {/* Selected Formats */}
                {selectedFormats.length > 0 && (
                    <div className="space-y-2">
                        <Label className="dark:text-gray-300">Selected Formats ({selectedFormats.length})</Label>
                        <div className="flex flex-wrap gap-2">
                            {selectedFormats.map((format) => (
                                <Badge key={format} variant="secondary" className="gap-1 dark:bg-gray-700 dark:text-gray-300">
                                    {format.toUpperCase()}
                                    <button
                                        type="button"
                                        onClick={() => onRemoveFormat(format)}
                                        className="ml-1 hover:text-red-600 dark:hover:text-red-400"
                                        disabled={isSubmitting}
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <Separator className="dark:bg-gray-700" />

            {/* Max File Size */}
            <div className="space-y-4">
                <Label className="dark:text-gray-300 flex items-center gap-2">
                    <HardDrive className="h-4 w-4" />
                    Maximum File Size
                </Label>
                <div className="flex gap-2">
                    <div className="flex-1">
                        <Input
                            type="number"
                            min="1"
                            max={fileSizeUnit === 'MB' ? '10' : '10240'}
                            value={fileSizeValue}
                            onChange={(e) => onFileSizeValueChange(parseInt(e.target.value) || 0)}
                            className={`${errors.max_file_size ? 'border-destructive' : ''} dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300`}
                            disabled={isSubmitting}
                        />
                    </div>
                    <Select
                        value={fileSizeUnit}
                        onValueChange={(value: 'KB' | 'MB') => onFileSizeUnitChange(value)}
                        disabled={isSubmitting}
                    >
                        <SelectTrigger className="w-24 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                            <SelectItem value="KB" className="dark:text-gray-300 dark:focus:bg-gray-700">KB</SelectItem>
                            <SelectItem value="MB" className="dark:text-gray-300 dark:focus:bg-gray-700">MB</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                {errors.max_file_size && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.max_file_size}</p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    Current: {formatFileSize(formData.max_file_size)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    Maximum allowed: 10MB (10240 KB)
                </p>
            </div>

            {/* Help text */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                    <HardDrive className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div className="flex-1">
                        <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">📄 File Specifications Guide</h4>
                        <ul className="list-disc list-inside space-y-1 text-xs text-blue-700 dark:text-blue-300">
                            <li>Select common formats from the grid or add custom formats</li>
                            <li>Set appropriate file size limits based on document type</li>
                            <li>Maximum file size is 10MB for all uploads</li>
                            <li>Clear formats to remove them from the accepted list</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}