// components/admin/forms/create/basic-info-tab.tsx
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
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
import { FileText, Tag, Building, HelpCircle } from 'lucide-react';
import type { FormFormData, FormCategory, FormAgency } from '@/types/admin/forms/forms.types';

interface BasicInfoTabProps {
    formData: FormFormData;
    errors: Record<string, string>;
    categories: FormCategory[] | string[];
    agencies: FormAgency[] | string[];
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onSelectChange: (name: string, value: string) => void;
    isSubmitting: boolean;
    // Optional props for edit mode
    originalTitle?: string;
    originalCategory?: string;
    originalAgency?: string;
}

export function BasicInfoTab({
    formData,
    errors,
    categories,
    agencies,
    onInputChange,
    onSelectChange,
    isSubmitting,
    originalTitle,
    originalCategory,
    originalAgency
}: BasicInfoTabProps) {
    // Check if fields have been modified
    const isTitleModified = originalTitle !== undefined && formData.title !== originalTitle;
    const isCategoryModified = originalCategory !== undefined && formData.category !== originalCategory;
    const isAgencyModified = originalAgency !== undefined && formData.issuing_agency !== originalAgency;

    // Helper to get category display name
    const getCategoryDisplayName = (category: string | FormCategory): string => {
        if (typeof category === 'object' && category !== null) {
            return category.name;
        }
        return category;
    };

    // Helper to get agency display name
    const getAgencyDisplayName = (agency: string | FormAgency): string => {
        if (typeof agency === 'object' && agency !== null) {
            return agency.name;
        }
        return agency;
    };

    return (
        <div className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="title" className="dark:text-gray-300">
                        Form Title <span className="text-red-500">*</span>
                    </Label>
                    {isTitleModified && (
                        <Badge variant="outline" className="text-xs text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                            Modified
                        </Badge>
                    )}
                </div>
                <div className="relative">
                    <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <Input
                        id="title"
                        name="title"
                        value={formData.title || ''}
                        onChange={onInputChange}
                        placeholder="e.g., Barangay Clearance Application Form"
                        className={`pl-10 ${errors.title ? 'border-destructive' : ''} dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300`}
                        disabled={isSubmitting}
                        autoFocus
                    />
                </div>
                {errors.title && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.title}</p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    Use the official form name for easy identification
                </p>
                {originalTitle && isTitleModified && (
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                        Original: {originalTitle}
                    </p>
                )}
            </div>

            {/* Description */}
            <div className="space-y-2">
                <Label htmlFor="description" className="dark:text-gray-300">Description</Label>
                <Textarea
                    id="description"
                    name="description"
                    value={formData.description || ''}
                    onChange={onInputChange}
                    placeholder="Describe the purpose and usage of this form..."
                    rows={4}
                    className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                    disabled={isSubmitting}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    Optional: Add a brief description to help residents understand the form's purpose
                </p>
            </div>

            {/* Category and Agency */}
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="category" className="dark:text-gray-300 flex items-center gap-1">
                            Category
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger type="button">
                                        <HelpCircle className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                    </TooltipTrigger>
                                    <TooltipContent className="dark:bg-gray-900 dark:text-gray-300">
                                        <p>Categorize the form for better organization</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </Label>
                        {isCategoryModified && (
                            <Badge variant="outline" className="text-xs text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                                Modified
                            </Badge>
                        )}
                    </div>
                    <Select
                        value={formData.category || ''}
                        onValueChange={(value) => onSelectChange('category', value)}
                        disabled={isSubmitting}
                    >
                        <SelectTrigger className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300">
                            <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                            <SelectItem value="" className="dark:text-gray-300">Uncategorized</SelectItem>
                            {categories.map((category) => {
                                const categoryName = getCategoryDisplayName(category);
                                const categoryValue = typeof category === 'object' ? category.slug || category.name : category;
                                return (
                                    <SelectItem key={categoryValue} value={categoryValue} className="dark:text-gray-300 dark:focus:bg-gray-700">
                                        <div className="flex items-center gap-2">
                                            <Tag className="h-3 w-3" />
                                            {categoryName}
                                        </div>
                                    </SelectItem>
                                );
                            })}
                        </SelectContent>
                    </Select>
                    {originalCategory && isCategoryModified && (
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                            Original: {originalCategory}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="issuing_agency" className="dark:text-gray-300 flex items-center gap-1">
                            Issuing Agency
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger type="button">
                                        <HelpCircle className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                    </TooltipTrigger>
                                    <TooltipContent className="dark:bg-gray-900 dark:text-gray-300">
                                        <p>Government agency that issues this form</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </Label>
                        {isAgencyModified && (
                            <Badge variant="outline" className="text-xs text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                                Modified
                            </Badge>
                        )}
                    </div>
                    <Select
                        value={formData.issuing_agency || ''}
                        onValueChange={(value) => onSelectChange('issuing_agency', value)}
                        disabled={isSubmitting}
                    >
                        <SelectTrigger className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300">
                            <SelectValue placeholder="Select agency" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                            <SelectItem value="" className="dark:text-gray-300">Not specified</SelectItem>
                            {agencies.map((agency) => {
                                const agencyName = getAgencyDisplayName(agency);
                                const agencyValue = typeof agency === 'object' ? agency.code || agency.name : agency;
                                return (
                                    <SelectItem key={agencyValue} value={agencyValue} className="dark:text-gray-300 dark:focus:bg-gray-700">
                                        <div className="flex items-center gap-2">
                                            <Building className="h-3 w-3" />
                                            {agencyName}
                                        </div>
                                    </SelectItem>
                                );
                            })}
                        </SelectContent>
                    </Select>
                    {originalAgency && isAgencyModified && (
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                            Original: {originalAgency}
                        </p>
                    )}
                </div>
            </div>

            {/* Help text */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div className="flex-1">
                        <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">📝 About Forms</h4>
                        <ul className="list-disc list-inside space-y-1 text-xs text-blue-700 dark:text-blue-300">
                            <li>Forms are downloadable documents for residents</li>
                            <li>Categories help residents find forms easily</li>
                            <li>Specify the issuing agency for official forms</li>
                            <li>Add a clear description to explain the form's purpose</li>
                            <li>Only active forms are visible to residents</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}