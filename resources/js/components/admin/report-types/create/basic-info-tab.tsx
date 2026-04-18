// components/admin/report-types/create/basic-info-tab.tsx
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
    Hash, Copy, Sparkles, HelpCircle, ChevronDown, 
    AlertCircle, AlertTriangle, Clock, Target, Zap,
    CheckCircle, Circle, FileText, Settings, ListChecks, Activity,
    RefreshCw,
    Check
} from 'lucide-react';
import React from 'react';
import type { ReportType } from '@/types/admin/report-types/report-types';

interface CategoryOption {
    value: string;
    label: string;
    description?: string;
    icon?: React.ElementType;
}

interface IconOption {
    value: string;
    label: string;
    icon: React.ElementType;
}

interface BasicInfoTabProps {
    formData: {
        name: string;
        code: string;
        description: string;
        category: string;
        subcategory: string;
        icon: string;
        color: string;
        priority_level: number;
        resolution_days: number;
        [key: string]: any;
    };
    errors: Record<string, string>;
    categoryOptions: CategoryOption[];
    priorityOptions: Record<number, string>;
    iconOptions: IconOption[];
    colorPresets: Array<{ value: string; name: string }>;
    selectedIcon: string;
    showIconPicker: boolean;
    searchIconTerm: string;
    filteredIcons: IconOption[];
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onSelectChange: (name: string, value: string) => void;
    onNumberChange: (name: string, value: string) => void;
    onCopyCode: () => void;
    onGenerateCode: () => void;
    onAutoGenerateToggle?: (checked: boolean) => void;
    onIconSelect: (iconValue: string) => void;
    onToggleIconPicker: () => void;
    onSearchIconChange: (term: string) => void;
    isSubmitting: boolean;
    // Optional props for edit mode
    originalName?: string;
    originalCode?: string;
    codeManuallyEdited?: boolean;
    copiedField?: string | null;
    onResetAutoGenerate?: () => void;
    autoGenerateCode?: boolean;
    setShowIconPicker?: (show: boolean) => void;
    setSearchIconTerm?: (term: string) => void;
}

export function BasicInfoTab({
    formData,
    errors,
    categoryOptions,
    priorityOptions,
    iconOptions,
    colorPresets,
    selectedIcon,
    showIconPicker,
    searchIconTerm,
    filteredIcons,
    onInputChange,
    onSelectChange,
    onNumberChange,
    onCopyCode,
    onGenerateCode,
    onAutoGenerateToggle,
    onIconSelect,
    onToggleIconPicker,
    onSearchIconChange,
    isSubmitting,
    originalName,
    originalCode,
    codeManuallyEdited = false,
    copiedField = null,
    onResetAutoGenerate,
    autoGenerateCode = true,
    setShowIconPicker,
    setSearchIconTerm
}: BasicInfoTabProps) {
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
                    value={formData.name || ''}
                    onChange={onInputChange}
                    placeholder="e.g., Noise Complaint"
                    className={`${errors.name ? 'border-destructive' : ''} dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300`}
                    disabled={isSubmitting}
                />
                {errors.name && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                )}
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
                                    <p>Unique identifier (uppercase letters, numbers, underscores)</p>
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
                            value={formData.code || ''}
                            onChange={onInputChange}
                            placeholder="e.g., NOISE_COMPLAINT"
                            className={`pl-10 font-mono ${errors.code ? 'border-destructive' : ''} ${codeManuallyEdited ? 'border-yellow-500 dark:border-yellow-600' : ''} dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300`}
                            disabled={autoGenerateCode || isSubmitting}
                        />
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={onGenerateCode}
                        disabled={!formData.name || autoGenerateCode || isSubmitting}
                        title="Generate from name"
                        className="dark:border-gray-600 dark:text-gray-300"
                    >
                        <Sparkles className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={onCopyCode}
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
                    {codeManuallyEdited && onResetAutoGenerate && (
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
                {codeManuallyEdited && !errors.code && (
                    <p className="text-xs text-yellow-600 dark:text-yellow-400">
                        Manual edit - auto-generation disabled
                    </p>
                )}
                {originalCode && isCodeModified && !codeManuallyEdited && (
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                        Original: {originalCode}
                    </p>
                )}
            </div>

            {/* Category and Subcategory */}
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="category" className="dark:text-gray-300">
                        Category <span className="text-red-500">*</span>
                    </Label>
                    <Select
                        value={formData.category || ""}
                        onValueChange={(value) => onSelectChange('category', value)}
                        disabled={isSubmitting}
                    >
                        <SelectTrigger className={`${errors.category ? 'border-destructive' : ''} dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300`}>
                            <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                            {categoryOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value} className="dark:text-gray-300">
                                    <div className="flex items-center gap-2">
                                        {option.icon && React.createElement(option.icon, { className: "h-4 w-4" })}
                                        {option.label}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.category && (
                        <p className="text-sm text-red-600 dark:text-red-400">{errors.category}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="subcategory" className="dark:text-gray-300">Subcategory (Optional)</Label>
                    <Input
                        id="subcategory"
                        name="subcategory"
                        value={formData.subcategory || ''}
                        onChange={onInputChange}
                        placeholder="e.g., neighbor, animals, parking"
                        className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                        disabled={isSubmitting}
                    />
                </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
                <Label htmlFor="description" className="dark:text-gray-300">Description</Label>
                <Textarea
                    id="description"
                    name="description"
                    value={formData.description || ''}
                    onChange={onInputChange}
                    placeholder="Enter a description for this report type"
                    rows={4}
                    className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                    disabled={isSubmitting}
                />
            </div>

            {/* Icon and Color */}
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="icon" className="dark:text-gray-300">Icon</Label>
                    <div className="relative">
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full justify-start gap-2 h-10 dark:border-gray-600 dark:text-gray-300"
                            onClick={onToggleIconPicker}
                        >
                            {selectedIcon && (
                                <>
                                    {React.createElement(
                                        iconOptions.find(i => i.value === selectedIcon)?.icon || AlertCircle,
                                        { className: "h-4 w-4" }
                                    )}
                                    <span className="flex-1 text-left">
                                        {iconOptions.find(i => i.value === selectedIcon)?.label || 'Select an icon'}
                                    </span>
                                </>
                            )}
                            <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>

                        {showIconPicker && (
                            <div className="absolute z-50 mt-1 w-full max-h-[400px] overflow-hidden bg-white dark:bg-gray-900 rounded-lg border dark:border-gray-700 shadow-lg">
                                <div className="p-2 border-b dark:border-gray-700">
                                    <Input
                                        placeholder="Search icons..."
                                        value={searchIconTerm}
                                        onChange={(e) => onSearchIconChange(e.target.value)}
                                        className="h-8 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                    />
                                </div>
                                <ScrollArea className="h-[300px]">
                                    <div className="p-2 grid grid-cols-4 gap-1">
                                        {filteredIcons.map((icon) => (
                                            <Button
                                                key={icon.value}
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className={`h-auto py-2 flex-col gap-1 ${
                                                    selectedIcon === icon.value ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800' : ''
                                                } dark:text-gray-300 dark:hover:text-white`}
                                                onClick={() => onIconSelect(icon.value)}
                                            >
                                                <icon.icon className="h-5 w-5" />
                                                <span className="text-[10px] text-center line-clamp-2">
                                                    {icon.label}
                                                </span>
                                            </Button>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="color" className="dark:text-gray-300">Color</Label>
                    <div className="flex gap-2">
                        <Input
                            id="color"
                            name="color"
                            type="color"
                            value={formData.color || '#3B82F6'}
                            onChange={onInputChange}
                            className="w-20 h-10 p-1 dark:bg-gray-900 dark:border-gray-700"
                            disabled={isSubmitting}
                        />
                        <div className="flex-1 grid grid-cols-6 gap-1">
                            {colorPresets.map((color) => (
                                <TooltipProvider key={color.value}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button
                                                type="button"
                                                className="w-8 h-8 rounded-full border-2 transition-all hover:scale-110"
                                                style={{ 
                                                    backgroundColor: color.value,
                                                    borderColor: formData.color === color.value ? '#000' : 'transparent'
                                                }}
                                                onClick={() => onSelectChange('color', color.value)}
                                                disabled={isSubmitting}
                                            />
                                        </TooltipTrigger>
                                        <TooltipContent side="bottom" className="dark:bg-gray-900 dark:text-gray-300">
                                            <p>{color.name}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Priority and Resolution */}
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="priority_level" className="dark:text-gray-300">Priority Level</Label>
                    <Select
                        value={formData.priority_level?.toString() || "3"}
                        onValueChange={(value) => onNumberChange('priority_level', value)}
                        disabled={isSubmitting}
                    >
                        <SelectTrigger className={`${errors.priority_level ? 'border-destructive' : ''} dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300`}>
                            <SelectValue placeholder="Select priority level" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                            {Object.entries(priorityOptions).map(([value, label]) => (
                                <SelectItem key={value} value={value} className="dark:text-gray-300">
                                    <div className="flex items-center gap-2">
                                        {value === '1' && <Zap className="h-4 w-4 text-red-500" />}
                                        {value === '2' && <AlertTriangle className="h-4 w-4 text-orange-500" />}
                                        {value === '3' && <Clock className="h-4 w-4 text-yellow-500" />}
                                        {value === '4' && <Target className="h-4 w-4 text-green-500" />}
                                        {label}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.priority_level && (
                        <p className="text-sm text-red-600 dark:text-red-400">{errors.priority_level}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="resolution_days" className="dark:text-gray-300">Resolution Days</Label>
                    <div className="relative">
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <Input
                            id="resolution_days"
                            name="resolution_days"
                            type="number"
                            min="1"
                            max="365"
                            value={formData.resolution_days || 7}
                            onChange={(e) => onNumberChange('resolution_days', e.target.value)}
                            className={`pl-10 ${errors.resolution_days ? 'border-destructive' : ''} dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300`}
                            disabled={isSubmitting}
                        />
                    </div>
                    {errors.resolution_days && (
                        <p className="text-sm text-red-600 dark:text-red-400">{errors.resolution_days}</p>
                    )}
                </div>
            </div>
        </div>
    );
}