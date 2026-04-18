// components/admin/privileges/create/discount-tab.tsx
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Percent, HelpCircle } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface DiscountTabProps {
    formData: any;
    errors: Record<string, string>;
    discountTypes: any[];
    selectedDiscountType: any;
    originalDiscountTypeId?: string;
    originalDiscountPercentage?: string;
    onSelectChange: (name: string, value: string) => void;
    onNumberChange: (name: string, value: string) => void;
    isSubmitting: boolean;
    isEdit?: boolean;
}

export function DiscountTab({
    formData,
    errors,
    discountTypes,
    selectedDiscountType,
    originalDiscountTypeId,
    originalDiscountPercentage,
    onSelectChange,
    onNumberChange,
    isSubmitting,
    isEdit = false
}: DiscountTabProps) {
    return (
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="discount_type_id" className="dark:text-gray-300">
                        Discount Type <span className="text-red-500">*</span>
                    </Label>
                    <Select
                        value={formData.discount_type_id?.toString() || ""}
                        onValueChange={(value) => onSelectChange('discount_type_id', value)}
                        disabled={isSubmitting}
                    >
                        <SelectTrigger className={`${errors.discount_type_id ? 'border-destructive' : ''} dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300`}>
                            <SelectValue placeholder="Select discount type" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                            {discountTypes.map((type) => (
                                <SelectItem key={type.id} value={type.id.toString()} className="dark:text-gray-300 dark:focus:bg-gray-700">
                                    <div className="flex items-center gap-2">
                                        <Percent className="h-3 w-3" />
                                        {type.name}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.discount_type_id && (
                        <p className="text-sm text-red-600 dark:text-red-400">{errors.discount_type_id}</p>
                    )}
                    {isEdit && originalDiscountTypeId && formData.discount_type_id !== originalDiscountTypeId && (
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                            Was: {discountTypes.find(dt => dt.id.toString() === originalDiscountTypeId)?.name}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="default_discount_percentage" className="dark:text-gray-300">
                        Discount Percentage (%) <span className="text-red-500">*</span>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger type="button">
                                    <HelpCircle className="h-4 w-4 text-gray-400 dark:text-gray-500 ml-1" />
                                </TooltipTrigger>
                                <TooltipContent className="dark:bg-gray-900 dark:text-gray-300">
                                    <p>Enter a percentage between 0 and 100</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </Label>
                    <div className="relative">
                        <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <Input
                            id="default_discount_percentage"
                            name="default_discount_percentage"
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={formData.default_discount_percentage}
                            onChange={(e) => onNumberChange('default_discount_percentage', e.target.value)}
                            className={`pl-10 ${errors.default_discount_percentage ? 'border-destructive' : ''} dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300`}
                            disabled={isSubmitting}
                        />
                    </div>
                    {errors.default_discount_percentage && (
                        <p className="text-sm text-red-600 dark:text-red-400">{errors.default_discount_percentage}</p>
                    )}
                    {isEdit && originalDiscountPercentage && formData.default_discount_percentage !== originalDiscountPercentage && (
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                            Was: {originalDiscountPercentage}%
                        </p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Enter a percentage between 0 and 100
                    </p>
                </div>
            </div>
        </div>
    );
}