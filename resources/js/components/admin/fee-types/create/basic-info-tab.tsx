// components/admin/fee-types/create/basic-info-tab.tsx
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Hash, Copy, RefreshCw, HelpCircle, Folder, Sparkles } from 'lucide-react';
import type { FeeFormData, CategoryOption } from '@/types/admin/fee-types/fee.types';

interface BasicInfoTabProps {
    formData: FeeFormData;
    copiedField?: string | null;
    errors: Record<string, string>;
    categories: CategoryOption[];
    autoGenerateCode: boolean;
    isGenerating: boolean;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onSelectChange: (name: keyof FeeFormData, value: string) => void;
    onCopyCode: () => void;
    onGenerateCode: () => void;
    onAutoGenerateToggle: (checked: boolean) => void;
    isSubmitting: boolean;
    // Optional props for edit mode
    originalName?: string;
    originalCode?: string;
    originalBaseAmount?: number;
    formatCurrency?: (amount: number) => string;
}

export function BasicInfoTab({
    formData,
    errors,
    categories,
    copiedField,
    autoGenerateCode,
    isGenerating,
    onInputChange,
    onSelectChange,
    onCopyCode,
    onGenerateCode,
    onAutoGenerateToggle,
    isSubmitting,
    originalName,
    originalCode,
    originalBaseAmount,
    formatCurrency
}: BasicInfoTabProps) {
    // Check if fields have been modified
    const isNameModified = originalName !== undefined && formData.name !== originalName;
    const isCodeModified = originalCode !== undefined && formData.code !== originalCode;

    return (
        <div className="space-y-4">
            {/* Name Field */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="name" className="dark:text-gray-300">
                        Name <span className="text-red-500">*</span>
                    </Label>
                    {isNameModified && (
                        <Badge variant="outline" className="text-xs text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                            Modified
                        </Badge>
                    )}
                </div>
                <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={onInputChange}
                    placeholder="e.g., Barangay Clearance, Business Permit"
                    className={`${errors.name ? 'border-destructive' : ''} dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300`}
                    disabled={isSubmitting}
                    autoFocus
                />
                {errors.name && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    Enter the fee type name first - the code will be auto-generated
                </p>
                {originalName && isNameModified && (
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                        Original: {originalName}
                    </p>
                )}
            </div>

            {/* Code Field */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="code" className="flex items-center gap-1 dark:text-gray-300">
                        Code <span className="text-red-500">*</span>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger type="button">
                                    <HelpCircle className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                </TooltipTrigger>
                                <TooltipContent className="dark:bg-gray-900 dark:text-gray-300">
                                    <p>Unique identifier for this fee type</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </Label>
                    {isCodeModified && (
                        <Badge variant="outline" className="text-xs text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                            Modified
                        </Badge>
                    )}
                </div>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <Input
                            id="code"
                            name="code"
                            value={formData.code}
                            onChange={onInputChange}
                            placeholder="e.g., BGY-CLR-001"
                            className={`pl-10 ${errors.code ? 'border-destructive' : ''} dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300`}
                            disabled={autoGenerateCode || isSubmitting}
                        />
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={onCopyCode}
                        disabled={!formData.code || isSubmitting}
                        title="Copy code"
                        className="dark:border-gray-600 dark:text-gray-300"
                    >
                        <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={onGenerateCode}
                        disabled={autoGenerateCode || isSubmitting}
                        title="Generate new code"
                        className="dark:border-gray-600 dark:text-gray-300"
                    >
                        <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
                <div className="flex items-center gap-2 mt-1">
                    <Switch
                        checked={autoGenerateCode}
                        onCheckedChange={onAutoGenerateToggle}
                        id="auto-generate-code"
                        disabled={isSubmitting}
                    />
                    <Label htmlFor="auto-generate-code" className="text-xs cursor-pointer dark:text-gray-400">
                        Auto-generate from name and category
                    </Label>
                </div>
                {errors.code && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.code}</p>
                )}
                {originalCode && isCodeModified && (
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                        Original: {originalCode}
                    </p>
                )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="short_name" className="dark:text-gray-300">Short Name</Label>
                    <Input
                        id="short_name"
                        name="short_name"
                        value={formData.short_name ?? ''}
                        onChange={onInputChange}
                        placeholder="e.g., Clearance, Permit"
                        className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                        disabled={isSubmitting}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Abbreviated name for display on receipts
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="category" className="dark:text-gray-300">
                        Category <span className="text-red-500">*</span>
                    </Label>
                    <Select
                        value={formData.document_category_id}
                        onValueChange={(value) => onSelectChange('document_category_id', value)}
                        disabled={isSubmitting}
                    >
                        <SelectTrigger className={`${errors.document_category_id ? 'border-destructive' : ''} dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300`}>
                            <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                            {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id.toString()} className="dark:text-gray-300 dark:focus:bg-gray-700">
                                    <div className="flex items-center gap-2">
                                        <Folder className="h-4 w-4" />
                                        {category.name}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.document_category_id && (
                        <p className="text-sm text-red-600 dark:text-red-400">{errors.document_category_id}</p>
                    )}
                </div>
            </div>

            {/* Base Amount Display (for edit mode) */}
            {formatCurrency && originalBaseAmount !== undefined && (
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Current Base Amount:</span>
                        <span className="font-medium dark:text-gray-200">{formatCurrency(originalBaseAmount)}</span>
                    </div>
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="description" className="dark:text-gray-300">Description</Label>
                <Textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={formData.description ?? ''}
                    onChange={onInputChange}
                    placeholder="Enter a description for this fee type"
                    className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                    disabled={isSubmitting}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    Detailed description of what this fee covers
                </p>
            </div>

            {/* Help text */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div className="flex-1">
                        <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">📝 About Fee Types</h4>
                        <ul className="list-disc list-inside space-y-1 text-xs text-blue-700 dark:text-blue-300">
                            <li>Fee types define charges for barangay services and permits</li>
                            <li>The code is used internally for system identification</li>
                            <li>Categories help organize fee types for reporting</li>
                            <li>Short name appears on receipts and statements</li>
                            <li>Only the highest applicable discount is applied (no stacking)</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}