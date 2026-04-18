// components/admin/document-types/create/basic-info-tab.tsx
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
import { Hash, Copy, Sparkles, HelpCircle, Folder, Check, RefreshCw } from 'lucide-react';

interface BasicInfoTabProps {
    formData: any;
    errors: Record<string, string>;
    categories: any[];
    autoGenerateCode: boolean;
    copiedField: string | null;
    codeManuallyEdited?: boolean;
    originalName?: string;
    originalCode?: string;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onSelectChange: (name: string, value: string) => void;
    onCopy: (text: string, field: string) => void;
    onGenerateCode: () => void;
    onAutoGenerateToggle: (checked: boolean) => void;
    onResetAutoGenerate?: () => void;
    isSubmitting: boolean;
    isEdit?: boolean;
}

export function BasicInfoTab({
    formData,
    errors,
    categories,
    autoGenerateCode,
    copiedField,
    codeManuallyEdited,
    originalName,
    originalCode,
    onInputChange,
    onSelectChange,
    onCopy,
    onGenerateCode,
    onAutoGenerateToggle,
    onResetAutoGenerate,
    isSubmitting,
    isEdit = false
}: BasicInfoTabProps) {
    return (
        <div className="space-y-4">
            {/* Name Field */}
            <div className="space-y-2">
                <Label htmlFor="name" className="dark:text-gray-300">
                    Name <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={onInputChange}
                    placeholder="e.g., Barangay Clearance"
                    className={`${errors.name ? 'border-destructive' : ''} dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300`}
                    disabled={isSubmitting}
                    autoFocus={!isEdit}
                />
                {errors.name && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                )}
                {isEdit && originalName && formData.name !== originalName && (
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                        Was: {originalName}
                    </p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    Enter the document type name first - the code will be auto-generated
                </p>
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
                                    <p>Unique identifier (uppercase letters, numbers, underscores)</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </Label>
                    <div className="flex items-center gap-2">
                        <Switch
                            checked={autoGenerateCode}
                            onCheckedChange={onAutoGenerateToggle}
                            id="auto-generate-code"
                        />
                        <Label htmlFor="auto-generate-code" className="text-xs cursor-pointer dark:text-gray-400">
                            Auto-generate
                        </Label>
                    </div>
                </div>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <Input
                            id="code"
                            name="code"
                            value={formData.code}
                            onChange={onInputChange}
                            placeholder="e.g., BARANGAY_CLEARANCE"
                            className={`pl-10 font-mono ${errors.code ? 'border-destructive' : ''} ${codeManuallyEdited ? 'border-yellow-500 dark:border-yellow-600' : ''} dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300`}
                            disabled={autoGenerateCode || isSubmitting}
                        />
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={onGenerateCode}
                        disabled={!formData.name || isSubmitting}
                        title="Generate from name"
                        className="dark:border-gray-600 dark:text-gray-300"
                    >
                        <Sparkles className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => onCopy(formData.code, 'Code')}
                        disabled={!formData.code || isSubmitting}
                        title="Copy to clipboard"
                        className="dark:border-gray-600 dark:text-gray-300"
                    >
                        {copiedField === 'Code' ? (
                            <Check className="h-4 w-4 text-green-600" />
                        ) : (
                            <Copy className="h-4 w-4" />
                        )}
                    </Button>
                    {isEdit && codeManuallyEdited && onResetAutoGenerate && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={onResetAutoGenerate}
                            disabled={isSubmitting}
                            title="Re-enable auto-generation"
                            className="text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300"
                        >
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    )}
                </div>
                {errors.code && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.code}</p>
                )}
                {isEdit && codeManuallyEdited && !errors.code && (
                    <p className="text-xs text-yellow-600 dark:text-yellow-400">
                        Manual edit - auto-generation disabled
                    </p>
                )}
                {isEdit && originalCode && formData.code !== originalCode && !codeManuallyEdited && (
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                        Was: {originalCode}
                    </p>
                )}
            </div>

            {/* Description */}
            <div className="space-y-2">
                <Label htmlFor="description" className="dark:text-gray-300">Description</Label>
                <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={onInputChange}
                    placeholder="Enter a description for this document type"
                    rows={4}
                    className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                    disabled={isSubmitting}
                />
            </div>

            {/* Category */}
            <div className="space-y-2">
                <Label htmlFor="document_category_id" className="dark:text-gray-300">
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

            {/* Help text */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div className="flex-1">
                        <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">📝 About Document Types</h4>
                        <ul className="list-disc list-inside space-y-1 text-xs text-blue-700 dark:text-blue-300">
                            <li>Document types define what files can be uploaded in the system</li>
                            <li>The code is used internally for system identification</li>
                            <li>Categories help organize documents for clearance types</li>
                            <li>Set appropriate file size limits based on document type</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}