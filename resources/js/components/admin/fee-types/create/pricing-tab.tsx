// components/admin/fee-types/create/pricing-tab.tsx
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { DollarSign, Percent, Info } from 'lucide-react';
import type { FeeFormData, PHILIPPINE_STANDARD_DISCOUNTS } from '@/types/admin/fee-types/fee.types';

interface PricingTabProps {
    formData: FeeFormData;
    errors: Record<string, string>;
    amountTypes: Record<string, string>;
    frequencies: Record<string, string>;
    showDiscountInfo: boolean;
    onNumberChange: (name: string, value: number | null) => void;
    onSelectChange: (name: string, value: string) => void;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onCheckboxChange: (name: string, checked: boolean) => void;
    onSeniorDiscountChange: (checked: boolean) => void;
    onPwdDiscountChange: (checked: boolean) => void;
    onSoloParentDiscountChange: (checked: boolean) => void;
    onIndigentDiscountChange: (checked: boolean) => void;
    onToggleDiscountInfo: () => void;
    formatCurrency: (amount: number) => string;
    isSubmitting: boolean;
}

export function PricingTab({
    formData,
    errors,
    amountTypes,
    frequencies,
    showDiscountInfo,
    onNumberChange,
    onSelectChange,
    onInputChange,
    onCheckboxChange,
    onSeniorDiscountChange,
    onPwdDiscountChange,
    onSoloParentDiscountChange,
    onIndigentDiscountChange,
    onToggleDiscountInfo,
    formatCurrency,
    isSubmitting
}: PricingTabProps) {
    return (
        <div className="space-y-6">
            {/* Pricing Configuration */}
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="dark:text-gray-100">Pricing Configuration</CardTitle>
                    <CardDescription className="dark:text-gray-400">
                        Configure pricing details for the fee
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="base_amount" className="dark:text-gray-300">Base Amount</Label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                <Input
                                    id="base_amount"
                                    name="base_amount"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    className={`pl-10 ${errors.base_amount ? 'border-destructive' : ''} dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300`}
                                    value={formData.base_amount}
                                    onChange={(e) => onNumberChange('base_amount', parseFloat(e.target.value) || 0)}
                                    disabled={isSubmitting}
                                />
                            </div>
                            {errors.base_amount && (
                                <p className="text-sm text-red-600 dark:text-red-400">{errors.base_amount}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="amount_type" className="dark:text-gray-300">Amount Type</Label>
                            <Select
                                value={formData.amount_type}
                                onValueChange={(value) => onSelectChange('amount_type', value)}
                                disabled={isSubmitting}
                            >
                                <SelectTrigger className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300">
                                    <SelectValue placeholder="Select amount type" />
                                </SelectTrigger>
                                <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                                    {Object.entries(amountTypes).map(([value, label]) => (
                                        <SelectItem key={value} value={value} className="dark:text-gray-300 dark:focus:bg-gray-700">
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="unit" className="dark:text-gray-300">Unit (Optional)</Label>
                            <Input
                                id="unit"
                                name="unit"
                                placeholder="e.g., per square meter, per month"
                                value={formData.unit}
                                onChange={onInputChange}
                                className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                disabled={isSubmitting}
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                e.g., "per certificate", "per month", "per year"
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Frequency & Validity */}
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="dark:text-gray-100">Frequency & Validity</CardTitle>
                    <CardDescription className="dark:text-gray-400">
                        Set how often this fee is charged and its validity period
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="frequency" className="dark:text-gray-300">Frequency</Label>
                            <Select
                                value={formData.frequency}
                                onValueChange={(value) => onSelectChange('frequency', value)}
                                disabled={isSubmitting}
                            >
                                <SelectTrigger className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300">
                                    <SelectValue placeholder="Select frequency" />
                                </SelectTrigger>
                                <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                                    {Object.entries(frequencies).map(([value, label]) => (
                                        <SelectItem key={value} value={value} className="dark:text-gray-300 dark:focus:bg-gray-700">
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                How often this fee is charged
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="validity_days" className="dark:text-gray-300">Validity Days (for certificates)</Label>
                            <Input
                                id="validity_days"
                                name="validity_days"
                                type="number"
                                min="1"
                                placeholder="e.g., 365 for one year"
                                value={formData.validity_days ?? ''}
                                onChange={(e) => onNumberChange('validity_days', e.target.value ? parseInt(e.target.value) : null)}
                                className={`${errors.validity_days ? 'border-destructive' : ''} dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300`}
                                disabled={isSubmitting}
                            />
                            {errors.validity_days && (
                                <p className="text-sm text-red-600 dark:text-red-400">{errors.validity_days}</p>
                            )}
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Number of days the certificate remains valid after issuance
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="effective_date" className="dark:text-gray-300">Effective Date</Label>
                            <Input
                                id="effective_date"
                                name="effective_date"
                                type="date"
                                value={formData.effective_date}
                                onChange={onInputChange}
                                className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                disabled={isSubmitting}
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                When this fee takes effect
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="expiry_date" className="dark:text-gray-300">Expiry Date (Optional)</Label>
                            <Input
                                id="expiry_date"
                                name="expiry_date"
                                type="date"
                                value={formData.expiry_date}
                                onChange={onInputChange}
                                min={formData.effective_date}
                                className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                disabled={isSubmitting}
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                When this fee expires (leave empty for no expiry)
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Discount Configuration */}
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="dark:text-gray-100">Discount Configuration</CardTitle>
                            <CardDescription className="dark:text-gray-400">
                                Configure discounts for eligible groups
                            </CardDescription>
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
                </CardHeader>
                
                {showDiscountInfo && (
                    <div className="px-6 pb-4">
                        <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                            <AlertDescription className="text-sm text-blue-700 dark:text-blue-400">
                                <p className="font-medium mb-2">Philippine Discount Rules:</p>
                                <ul className="list-disc pl-4 space-y-1">
                                    <li><strong>Senior Citizens (RA 9994):</strong> 20% discount on basic goods and services</li>
                                    <li><strong>PWD (RA 10754):</strong> 20% discount on basic goods and services</li>
                                    <li><strong>Solo Parents (RA 8972):</strong> 10% discount on select services</li>
                                    <li><strong>Indigents:</strong> Varies (typically 50-100% based on assessment)</li>
                                    <li>Only the highest applicable discount is applied (no stacking)</li>
                                </ul>
                            </AlertDescription>
                        </Alert>
                    </div>
                )}
                
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                        {/* Senior Citizen */}
                        <div className="space-y-3 p-4 border rounded-lg dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="has_senior_discount"
                                        checked={formData.has_senior_discount}
                                        onCheckedChange={(checked) => onSeniorDiscountChange(checked as boolean)}
                                        disabled={isSubmitting}
                                    />
                                    <Label htmlFor="has_senior_discount" className="font-medium dark:text-gray-200">Senior Citizen</Label>
                                </div>
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                    20% (RA 9994)
                                </Badge>
                            </div>
                            {formData.has_senior_discount && (
                                <div className="pl-6">
                                    <Label className="text-sm dark:text-gray-300">Discount Percentage</Label>
                                    <div className="relative mt-1">
                                        <Input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max="100"
                                            className="pl-10 dark:bg-gray-900 dark:border-gray-700"
                                            value={formData.senior_discount_percentage ?? ''}
                                            onChange={(e) => onNumberChange('senior_discount_percentage', e.target.value ? parseFloat(e.target.value) : null)}
                                            disabled={isSubmitting}
                                            placeholder="20"
                                        />
                                        <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        RA 9994 standard: 20% discount
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* PWD */}
                        <div className="space-y-3 p-4 border rounded-lg dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="has_pwd_discount"
                                        checked={formData.has_pwd_discount}
                                        onCheckedChange={(checked) => onPwdDiscountChange(checked as boolean)}
                                        disabled={isSubmitting}
                                    />
                                    <Label htmlFor="has_pwd_discount" className="font-medium dark:text-gray-200">PWD</Label>
                                </div>
                                <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                    20% (RA 10754)
                                </Badge>
                            </div>
                            {formData.has_pwd_discount && (
                                <div className="pl-6">
                                    <Label className="text-sm dark:text-gray-300">Discount Percentage</Label>
                                    <div className="relative mt-1">
                                        <Input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max="100"
                                            className="pl-10 dark:bg-gray-900 dark:border-gray-700"
                                            value={formData.pwd_discount_percentage ?? ''}
                                            onChange={(e) => onNumberChange('pwd_discount_percentage', e.target.value ? parseFloat(e.target.value) : null)}
                                            disabled={isSubmitting}
                                            placeholder="20"
                                        />
                                        <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        RA 10754 standard: 20% discount
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Solo Parent */}
                        <div className="space-y-3 p-4 border rounded-lg dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="has_solo_parent_discount"
                                        checked={formData.has_solo_parent_discount}
                                        onCheckedChange={(checked) => onSoloParentDiscountChange(checked as boolean)}
                                        disabled={isSubmitting}
                                    />
                                    <Label htmlFor="has_solo_parent_discount" className="font-medium dark:text-gray-200">Solo Parent</Label>
                                </div>
                                <Badge variant="outline" className="bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                                    10% (RA 8972)
                                </Badge>
                            </div>
                            {formData.has_solo_parent_discount && (
                                <div className="pl-6">
                                    <Label className="text-sm dark:text-gray-300">Discount Percentage</Label>
                                    <div className="relative mt-1">
                                        <Input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max="100"
                                            className="pl-10 dark:bg-gray-900 dark:border-gray-700"
                                            value={formData.solo_parent_discount_percentage ?? ''}
                                            onChange={(e) => onNumberChange('solo_parent_discount_percentage', e.target.value ? parseFloat(e.target.value) : null)}
                                            disabled={isSubmitting}
                                            placeholder="10"
                                        />
                                        <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        RA 8972 standard: 10% discount
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Indigent */}
                        <div className="space-y-3 p-4 border rounded-lg dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="has_indigent_discount"
                                        checked={formData.has_indigent_discount}
                                        onCheckedChange={(checked) => onIndigentDiscountChange(checked as boolean)}
                                        disabled={isSubmitting}
                                    />
                                    <Label htmlFor="has_indigent_discount" className="font-medium dark:text-gray-200">Indigent</Label>
                                </div>
                                <Badge variant="outline" className="bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                                    Varies (50-100%)
                                </Badge>
                            </div>
                            {formData.has_indigent_discount && (
                                <div className="pl-6">
                                    <Label className="text-sm dark:text-gray-300">Discount Percentage</Label>
                                    <div className="relative mt-1">
                                        <Input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max="100"
                                            className="pl-10 dark:bg-gray-900 dark:border-gray-700"
                                            value={formData.indigent_discount_percentage ?? ''}
                                            onChange={(e) => onNumberChange('indigent_discount_percentage', e.target.value ? parseFloat(e.target.value) : null)}
                                            disabled={isSubmitting}
                                            placeholder="50"
                                        />
                                        <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Based on indigent classification and LGU policy
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Penalties */}
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="dark:text-gray-100">Late Payment Penalties</CardTitle>
                    <CardDescription className="dark:text-gray-400">
                        Configure surcharges and penalties for late payments
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Surcharge */}
                        <div className="space-y-3">
                            <div className="flex items-center space-x-2 p-3 border rounded-lg dark:border-gray-700">
                                <Checkbox
                                    id="has_surcharge"
                                    checked={formData.has_surcharge}
                                    onCheckedChange={(checked) => onCheckboxChange('has_surcharge', checked as boolean)}
                                    disabled={isSubmitting}
                                />
                                <Label htmlFor="has_surcharge" className="cursor-pointer dark:text-gray-300">Apply Monthly Surcharge</Label>
                            </div>
                            {formData.has_surcharge && (
                                <div className="space-y-3 pl-6">
                                    <div>
                                        <Label className="text-sm dark:text-gray-300">Monthly Rate (%)</Label>
                                        <div className="relative mt-1">
                                            <Input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                max="100"
                                                className="pl-10 dark:bg-gray-900 dark:border-gray-700"
                                                value={formData.surcharge_percentage ?? ''}
                                                onChange={(e) => onNumberChange('surcharge_percentage', e.target.value ? parseFloat(e.target.value) : null)}
                                                disabled={isSubmitting}
                                                placeholder="2"
                                            />
                                            <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            Percentage applied monthly on overdue amount
                                        </p>
                                    </div>
                                    <div>
                                        <Label className="text-sm dark:text-gray-300">Fixed Amount (₱)</Label>
                                        <div className="relative mt-1">
                                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <Input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                className="pl-10 dark:bg-gray-900 dark:border-gray-700"
                                                value={formData.surcharge_fixed ?? ''}
                                                onChange={(e) => onNumberChange('surcharge_fixed', e.target.value ? parseFloat(e.target.value) : null)}
                                                disabled={isSubmitting}
                                                placeholder="50"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            Fixed surcharge amount applied monthly
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Penalty */}
                        <div className="space-y-3">
                            <div className="flex items-center space-x-2 p-3 border rounded-lg dark:border-gray-700">
                                <Checkbox
                                    id="has_penalty"
                                    checked={formData.has_penalty}
                                    onCheckedChange={(checked) => onCheckboxChange('has_penalty', checked as boolean)}
                                    disabled={isSubmitting}
                                />
                                <Label htmlFor="has_penalty" className="cursor-pointer dark:text-gray-300">Apply One-Time Penalty</Label>
                            </div>
                            {formData.has_penalty && (
                                <div className="space-y-3 pl-6">
                                    <div>
                                        <Label className="text-sm dark:text-gray-300">Penalty Percentage (%)</Label>
                                        <div className="relative mt-1">
                                            <Input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                max="100"
                                                className="pl-10 dark:bg-gray-900 dark:border-gray-700"
                                                value={formData.penalty_percentage ?? ''}
                                                onChange={(e) => onNumberChange('penalty_percentage', e.target.value ? parseFloat(e.target.value) : null)}
                                                disabled={isSubmitting}
                                                placeholder="10"
                                            />
                                            <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            One-time percentage penalty on overdue amount
                                        </p>
                                    </div>
                                    <div>
                                        <Label className="text-sm dark:text-gray-300">Fixed Penalty (₱)</Label>
                                        <div className="relative mt-1">
                                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <Input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                className="pl-10 dark:bg-gray-900 dark:border-gray-700"
                                                value={formData.penalty_fixed ?? ''}
                                                onChange={(e) => onNumberChange('penalty_fixed', e.target.value ? parseFloat(e.target.value) : null)}
                                                disabled={isSubmitting}
                                                placeholder="100"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            One-time fixed penalty amount
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Penalty Notes */}
                    {(formData.has_surcharge || formData.has_penalty) && (
                        <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                            <p className="text-xs text-amber-700 dark:text-amber-400">
                                <strong>Note:</strong> Penalties are applied when payment is made after the due date. 
                                If both percentage and fixed amount are set, the higher amount will be applied.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}