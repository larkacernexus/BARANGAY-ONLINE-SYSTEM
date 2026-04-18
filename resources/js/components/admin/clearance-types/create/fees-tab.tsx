// components/admin/clearance-types/create/fees-tab.tsx
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Clock, Calendar, Plus, X } from 'lucide-react';

interface FeesTabProps {
    formData: any;
    errors: Record<string, string>;
    purposeOptions: string[];
    newPurposeOption: string;
    originalFee?: number;
    originalProcessingDays?: number;
    originalValidityDays?: number;
    onNumberChange: (name: string, value: number) => void;
    onAddPurposeOption: () => void;
    onRemovePurposeOption: (index: number) => void;
    onNewPurposeOptionChange: (value: string) => void;
    formatCurrency?: (amount: number) => string;
    isSubmitting: boolean;
}

export function FeesTab({
    formData,
    errors,
    purposeOptions,
    newPurposeOption,
    originalFee,
    originalProcessingDays,
    originalValidityDays,
    onNumberChange,
    onAddPurposeOption,
    onRemovePurposeOption,
    onNewPurposeOptionChange,
    formatCurrency = (amount) => `₱${amount.toFixed(2)}`,
    isSubmitting
}: FeesTabProps) {
    return (
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                    <Label htmlFor="fee" className="dark:text-gray-300">Fee (₱)</Label>
                    <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <Input
                            id="fee"
                            name="fee"
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.fee}
                            onChange={(e) => onNumberChange('fee', parseFloat(e.target.value) || 0)}
                            className={`pl-10 ${errors.fee ? 'border-destructive' : ''} dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300`}
                            disabled={isSubmitting}
                        />
                    </div>
                    {errors.fee && (
                        <p className="text-sm text-red-600 dark:text-red-400">{errors.fee}</p>
                    )}
                    {originalFee !== undefined && formData.fee !== originalFee && (
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                            Was: {formatCurrency(originalFee)}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="processing_days" className="dark:text-gray-300">Processing Days</Label>
                    <div className="relative">
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <Input
                            id="processing_days"
                            name="processing_days"
                            type="number"
                            min="1"
                            value={formData.processing_days}
                            onChange={(e) => onNumberChange('processing_days', parseInt(e.target.value) || 1)}
                            className={`pl-10 ${errors.processing_days ? 'border-destructive' : ''} dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300`}
                            disabled={isSubmitting}
                        />
                    </div>
                    {errors.processing_days && (
                        <p className="text-sm text-red-600 dark:text-red-400">{errors.processing_days}</p>
                    )}
                    {originalProcessingDays !== undefined && formData.processing_days !== originalProcessingDays && (
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                            Was: {originalProcessingDays} days
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="validity_days" className="dark:text-gray-300">Validity (Days)</Label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <Input
                            id="validity_days"
                            name="validity_days"
                            type="number"
                            min="1"
                            value={formData.validity_days}
                            onChange={(e) => onNumberChange('validity_days', parseInt(e.target.value) || 30)}
                            className={`pl-10 ${errors.validity_days ? 'border-destructive' : ''} dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300`}
                            disabled={isSubmitting}
                        />
                    </div>
                    {errors.validity_days && (
                        <p className="text-sm text-red-600 dark:text-red-400">{errors.validity_days}</p>
                    )}
                    {originalValidityDays !== undefined && formData.validity_days !== originalValidityDays && (
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                            Was: {originalValidityDays} days
                        </p>
                    )}
                </div>
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="font-medium dark:text-gray-300">Estimated Completion:</div>
                <div>Clearance will be processed within {formData.processing_days} business day{formData.processing_days !== 1 ? 's' : ''}</div>
                <div>Valid for {formData.validity_days} day{formData.validity_days !== 1 ? 's' : ''} from issue date</div>
            </div>

            {/* Purpose Options */}
            <div className="space-y-3 pt-4">
                <Label className="dark:text-gray-300">Purpose Options</Label>
                <div className="flex flex-wrap gap-2">
                    {purposeOptions.map((option, index) => (
                        <Badge
                            key={index}
                            variant="secondary"
                            className="flex items-center gap-1 dark:bg-gray-700 dark:text-gray-300"
                        >
                            {option}
                            <button
                                type="button"
                                onClick={() => onRemovePurposeOption(index)}
                                className="ml-1 hover:text-red-600 dark:hover:text-red-400"
                                disabled={isSubmitting}
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
                <div className="flex gap-2">
                    <Input
                        value={newPurposeOption}
                        onChange={(e) => onNewPurposeOptionChange(e.target.value)}
                        placeholder="Add a new purpose option..."
                        className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                onAddPurposeOption();
                            }
                        }}
                        disabled={isSubmitting}
                    />
                    <Button
                        type="button"
                        onClick={onAddPurposeOption}
                        variant="outline"
                        size="sm"
                        className="dark:border-gray-600 dark:text-gray-300"
                        disabled={isSubmitting}
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}