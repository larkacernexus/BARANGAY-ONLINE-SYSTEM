// components/admin/fee-types/create/discounts-tab.tsx
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Percent, Info, AlertCircle, Shield, CheckCircle } from 'lucide-react';
import type { FeeFormData } from '@/types/admin/fee-types/fee.types';

interface DiscountsTabProps {
    formData: FeeFormData;
    errors: Record<string, string>;
    showDiscountInfo: boolean;
    activeDiscountCount: number;
    onNumberChange: (name: keyof FeeFormData, value: number | null) => void;
    onDiscountChange: (type: 'senior' | 'pwd' | 'solo_parent' | 'indigent', checked: boolean) => void;
    onToggleDiscountInfo: () => void;
    isSubmitting: boolean;
    isEdit?: boolean;
    originalSeniorDiscount?: boolean;
    originalPwdDiscount?: boolean;
    originalSoloParentDiscount?: boolean;
    originalIndigentDiscount?: boolean;
}

// Philippine standard discount rates
const PHILIPPINE_STANDARD_DISCOUNTS = {
    senior: 20,
    pwd: 20,
    solo_parent: 10,
    indigent: 50
};

export function DiscountsTab({
    formData,
    errors,
    showDiscountInfo,
    activeDiscountCount,
    onNumberChange,
    onDiscountChange,
    onToggleDiscountInfo,
    isSubmitting,
    isEdit = false,
    originalSeniorDiscount,
    originalPwdDiscount,
    originalSoloParentDiscount,
    originalIndigentDiscount
}: DiscountsTabProps) {
    return (
        <div className="space-y-6">
            {/* Header with Guidelines Button */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-medium dark:text-gray-300">Discount Configuration</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Configure discounts for eligible groups based on Philippine laws
                    </p>
                </div>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onToggleDiscountInfo}
                    className="dark:text-gray-400 dark:hover:text-white"
                >
                    <Info className="h-4 w-4 mr-1" />
                    Guidelines
                </Button>
            </div>

            {/* Discount Guidelines */}
            {showDiscountInfo && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-blue-700 dark:text-blue-300">
                            <p className="font-medium mb-2">Philippine Discount Rules:</p>
                            <ul className="list-disc pl-4 space-y-1">
                                <li><strong>Senior Citizens (RA 9994):</strong> 20% discount mandated by law for senior citizens</li>
                                <li><strong>PWD (RA 10754):</strong> 20% discount for persons with disabilities</li>
                                <li><strong>Solo Parents (RA 8972):</strong> 10% discount for solo parents</li>
                                <li><strong>Indigents:</strong> 50-100% discount for indigent families</li>
                                <li>Only the highest applicable discount applies (discounts don't stack)</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* Discount Cards Grid */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* Senior Citizen Discount */}
                <div className="space-y-3 p-4 border rounded-lg dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="has_senior_discount"
                                checked={formData.has_senior_discount}
                                onCheckedChange={(checked) => onDiscountChange('senior', checked as boolean)}
                                disabled={isSubmitting}
                                className="dark:border-gray-600"
                            />
                            <Label htmlFor="has_senior_discount" className="font-medium dark:text-gray-200">
                                Senior Citizen
                            </Label>
                        </div>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                            {PHILIPPINE_STANDARD_DISCOUNTS.senior}%
                        </Badge>
                    </div>
                    {formData.has_senior_discount && (
                        <div className="pl-6">
                            <Label className="text-sm dark:text-gray-300">Discount Percentage</Label>
                            <div className="relative mt-1">
                                <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    className="pl-10 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                    value={formData.senior_discount_percentage ?? ''}
                                    onChange={(e) => onNumberChange('senior_discount_percentage', e.target.value ? parseFloat(e.target.value) : null)}
                                    disabled={isSubmitting}
                                    placeholder={String(PHILIPPINE_STANDARD_DISCOUNTS.senior)}
                                />
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                RA 9994 standard: {PHILIPPINE_STANDARD_DISCOUNTS.senior}% discount
                            </p>
                            {isEdit && originalSeniorDiscount !== undefined && formData.has_senior_discount !== originalSeniorDiscount && (
                                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                    Was: {originalSeniorDiscount ? 'Enabled' : 'Disabled'}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* PWD Discount */}
                <div className="space-y-3 p-4 border rounded-lg dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="has_pwd_discount"
                                checked={formData.has_pwd_discount}
                                onCheckedChange={(checked) => onDiscountChange('pwd', checked as boolean)}
                                disabled={isSubmitting}
                                className="dark:border-gray-600"
                            />
                            <Label htmlFor="has_pwd_discount" className="font-medium dark:text-gray-200">
                                PWD (Persons with Disability)
                            </Label>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            {PHILIPPINE_STANDARD_DISCOUNTS.pwd}%
                        </Badge>
                    </div>
                    {formData.has_pwd_discount && (
                        <div className="pl-6">
                            <Label className="text-sm dark:text-gray-300">Discount Percentage</Label>
                            <div className="relative mt-1">
                                <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    className="pl-10 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                    value={formData.pwd_discount_percentage ?? ''}
                                    onChange={(e) => onNumberChange('pwd_discount_percentage', e.target.value ? parseFloat(e.target.value) : null)}
                                    disabled={isSubmitting}
                                    placeholder={String(PHILIPPINE_STANDARD_DISCOUNTS.pwd)}
                                />
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                RA 10754 standard: {PHILIPPINE_STANDARD_DISCOUNTS.pwd}% discount
                            </p>
                            {isEdit && originalPwdDiscount !== undefined && formData.has_pwd_discount !== originalPwdDiscount && (
                                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                    Was: {originalPwdDiscount ? 'Enabled' : 'Disabled'}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Solo Parent Discount */}
                <div className="space-y-3 p-4 border rounded-lg dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="has_solo_parent_discount"
                                checked={formData.has_solo_parent_discount}
                                onCheckedChange={(checked) => onDiscountChange('solo_parent', checked as boolean)}
                                disabled={isSubmitting}
                                className="dark:border-gray-600"
                            />
                            <Label htmlFor="has_solo_parent_discount" className="font-medium dark:text-gray-200">
                                Solo Parent
                            </Label>
                        </div>
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                            {PHILIPPINE_STANDARD_DISCOUNTS.solo_parent}%
                        </Badge>
                    </div>
                    {formData.has_solo_parent_discount && (
                        <div className="pl-6">
                            <Label className="text-sm dark:text-gray-300">Discount Percentage</Label>
                            <div className="relative mt-1">
                                <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    className="pl-10 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                    value={formData.solo_parent_discount_percentage ?? ''}
                                    onChange={(e) => onNumberChange('solo_parent_discount_percentage', e.target.value ? parseFloat(e.target.value) : null)}
                                    disabled={isSubmitting}
                                    placeholder={String(PHILIPPINE_STANDARD_DISCOUNTS.solo_parent)}
                                />
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                RA 8972 standard: {PHILIPPINE_STANDARD_DISCOUNTS.solo_parent}% discount
                            </p>
                            {isEdit && originalSoloParentDiscount !== undefined && formData.has_solo_parent_discount !== originalSoloParentDiscount && (
                                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                    Was: {originalSoloParentDiscount ? 'Enabled' : 'Disabled'}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Indigent Discount */}
                <div className="space-y-3 p-4 border rounded-lg dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="has_indigent_discount"
                                checked={formData.has_indigent_discount}
                                onCheckedChange={(checked) => onDiscountChange('indigent', checked as boolean)}
                                disabled={isSubmitting}
                                className="dark:border-gray-600"
                            />
                            <Label htmlFor="has_indigent_discount" className="font-medium dark:text-gray-200">
                                Indigent
                            </Label>
                        </div>
                        <Badge variant="outline" className="bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                            {PHILIPPINE_STANDARD_DISCOUNTS.indigent}%
                        </Badge>
                    </div>
                    {formData.has_indigent_discount && (
                        <div className="pl-6">
                            <Label className="text-sm dark:text-gray-300">Discount Percentage</Label>
                            <div className="relative mt-1">
                                <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    className="pl-10 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                    value={formData.indigent_discount_percentage ?? ''}
                                    onChange={(e) => onNumberChange('indigent_discount_percentage', e.target.value ? parseFloat(e.target.value) : null)}
                                    disabled={isSubmitting}
                                    placeholder={String(PHILIPPINE_STANDARD_DISCOUNTS.indigent)}
                                />
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Based on indigent classification and LGU policy
                            </p>
                            {isEdit && originalIndigentDiscount !== undefined && formData.has_indigent_discount !== originalIndigentDiscount && (
                                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                    Was: {originalIndigentDiscount ? 'Enabled' : 'Disabled'}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Summary of Active Discounts */}
            {activeDiscountCount === 0 ? (
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-center border border-gray-200 dark:border-gray-700">
                    <Shield className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">No discounts configured for this fee type</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        Enable discounts above to offer reduced rates for eligible groups
                    </p>
                </div>
            ) : (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span className="font-medium text-green-800 dark:text-green-300">
                            {activeDiscountCount} Discount{activeDiscountCount !== 1 ? 's' : ''} Active
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {formData.has_senior_discount && (
                            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                Senior: {formData.senior_discount_percentage}%
                            </Badge>
                        )}
                        {formData.has_pwd_discount && (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                PWD: {formData.pwd_discount_percentage}%
                            </Badge>
                        )}
                        {formData.has_solo_parent_discount && (
                            <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                                Solo Parent: {formData.solo_parent_discount_percentage}%
                            </Badge>
                        )}
                        {formData.has_indigent_discount && (
                            <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                                Indigent: {formData.indigent_discount_percentage}%
                            </Badge>
                        )}
                    </div>
                </div>
            )}

            {/* Important Note */}
            <Separator className="dark:bg-gray-700" />
            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-amber-700 dark:text-amber-300">
                        <p className="font-medium">Important Note:</p>
                        <p className="mt-1">
                            Only the highest applicable discount will be applied. Discounts do not stack.
                            For example, if a senior citizen is also a PWD, only the 20% discount applies once.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}