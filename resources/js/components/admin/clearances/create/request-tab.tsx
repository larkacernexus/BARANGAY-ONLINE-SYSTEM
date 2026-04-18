// components/admin/clearances/create/request-tab.tsx
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
import { Calendar, Clock, Zap, DollarSign, FileText, AlertCircle, Info } from 'lucide-react';
import type { ClearanceType, UrgencyLevel } from '@/types/admin/clearances/clearance';

interface RequestTabProps {
    formData: {
        clearance_type_id: string;
        urgency: UrgencyLevel;
        needed_date: string;
        purpose: string;
        specific_purpose: string;
        additional_requirements: string;
        fee_amount: number;
    };
    errors: Record<string, string>;
    activeClearanceTypes: ClearanceType[];
    safePurposeOptions: string[];
    selectedClearanceType: ClearanceType | null;
    isSubmitting: boolean;
    onSelectChange: (name: string, value: string) => void;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    formatCurrency: (amount: number) => string;
    // Optional props for edit mode
    originalClearanceTypeId?: string;
    originalPurpose?: string;
    originalUrgency?: UrgencyLevel;
    isLocked?: boolean;  // Add this prop
}

export function RequestTab({
    formData,
    errors,
    activeClearanceTypes,
    safePurposeOptions,
    selectedClearanceType,
    isSubmitting,
    onSelectChange,
    onInputChange,
    formatCurrency,
    originalClearanceTypeId,
    originalPurpose,
    originalUrgency,
    isLocked = false  // Add with default value
}: RequestTabProps) {
    // Check if values have been modified
    const isClearanceTypeModified = originalClearanceTypeId !== undefined && formData.clearance_type_id !== originalClearanceTypeId;
    const isPurposeModified = originalPurpose !== undefined && formData.purpose !== originalPurpose;
    const isUrgencyModified = originalUrgency !== undefined && formData.urgency !== originalUrgency;

    // Calculate estimated processing days based on urgency
    const getEstimatedDays = () => {
        if (!selectedClearanceType) return 0;
        let days = selectedClearanceType.processing_days;
        if (formData.urgency === 'rush') {
            days = Math.ceil(days * 0.5);
        } else if (formData.urgency === 'express') {
            days = 1;
        }
        return days;
    };

    // Get urgency color
    const getUrgencyColor = (urgency: UrgencyLevel): string => {
        switch (urgency) {
            case 'express': return 'text-orange-600 dark:text-orange-400';
            case 'rush': return 'text-amber-600 dark:text-amber-400';
            default: return 'text-blue-600 dark:text-blue-400';
        }
    };

    // Get urgency badge color
    const getUrgencyBadgeColor = (urgency: UrgencyLevel): string => {
        switch (urgency) {
            case 'express': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
            case 'rush': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
            default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
        }
    };

    const estimatedDays = getEstimatedDays();

    return (
        <div className="space-y-4">
            {/* Clearance Type */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="clearance_type_id" className="dark:text-gray-300">
                        Clearance Type <span className="text-red-500">*</span>
                    </Label>
                    {isClearanceTypeModified && (
                        <Badge variant="outline" className="text-xs text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                            Modified
                        </Badge>
                    )}
                </div>
                <Select
                    value={formData.clearance_type_id}
                    onValueChange={(value) => onSelectChange('clearance_type_id', value)}
                    disabled={isSubmitting}
                >
                    <SelectTrigger className={`${errors.clearance_type_id ? 'border-destructive' : ''} dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300`}>
                        <SelectValue placeholder="Select clearance type" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                        {activeClearanceTypes.map(type => (
                            <SelectItem key={type.id} value={type.id.toString()} className="dark:text-gray-300 dark:focus:bg-gray-700">
                                <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4" />
                                        <span>{type.name}</span>
                                        {type.is_popular && (
                                            <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                                                Popular
                                            </Badge>
                                        )}
                                    </div>
                                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-4">
                                        {formatCurrency(type.fee)}
                                    </span>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors.clearance_type_id && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.clearance_type_id}</p>
                )}
                {originalClearanceTypeId && isClearanceTypeModified && (
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                        Original: {activeClearanceTypes.find(t => t.id.toString() === originalClearanceTypeId)?.name || originalClearanceTypeId}
                    </p>
                )}
                {selectedClearanceType && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-medium">Processing time:</span> {selectedClearanceType.processing_days} business days
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-medium">Validity:</span> {selectedClearanceType.validity_days} days
                        </p>
                        {selectedClearanceType.description && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {selectedClearanceType.description}
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Urgency and Needed Date */}
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="urgency" className="dark:text-gray-300">
                            Processing Urgency <span className="text-red-500">*</span>
                        </Label>
                        {isUrgencyModified && (
                            <Badge variant="outline" className="text-xs text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                                Modified
                            </Badge>
                        )}
                    </div>
                    <Select
                        value={formData.urgency}
                        onValueChange={(value) => onSelectChange('urgency', value)}
                        disabled={isSubmitting}
                    >
                        <SelectTrigger className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                            <SelectItem value="normal">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    <span>Normal ({selectedClearanceType?.processing_days || 3} days)</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="rush">
                                <div className="flex items-center gap-2">
                                    <Zap className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                    <span>Rush (+50% fee, {selectedClearanceType ? Math.ceil(selectedClearanceType.processing_days * 0.5) : 2} days)</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="express">
                                <div className="flex items-center gap-2">
                                    <Zap className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                    <span>Express (+100% fee, 1 day)</span>
                                </div>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                    {originalUrgency !== undefined && isUrgencyModified && (
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                            Original: {originalUrgency.charAt(0).toUpperCase() + originalUrgency.slice(1)}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="needed_date" className="dark:text-gray-300">
                        Needed By Date <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <Input
                            id="needed_date"
                            name="needed_date"
                            type="date"
                            value={formData.needed_date}
                            onChange={onInputChange}
                            min={new Date().toISOString().split('T')[0]}
                            className={`pl-10 ${errors.needed_date ? 'border-destructive' : ''} dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300`}
                            disabled={isSubmitting}
                        />
                    </div>
                    {errors.needed_date && (
                        <p className="text-sm text-red-600 dark:text-red-400">{errors.needed_date}</p>
                    )}
                </div>
            </div>

            {/* Urgency Info Card */}
            {formData.urgency !== 'normal' && (
                <div className={`p-3 rounded-lg border ${getUrgencyBadgeColor(formData.urgency)}`}>
                    <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 mt-0.5" />
                        <div className="text-sm">
                            <p className="font-medium">Urgency Fee Applied</p>
                            <p>
                                {formData.urgency === 'rush' && '50% surcharge added for rush processing'}
                                {formData.urgency === 'express' && '100% surcharge added for express processing'}
                            </p>
                            <p className="text-xs mt-1">
                                Estimated completion: {estimatedDays} business day{estimatedDays !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Purpose */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="purpose" className="dark:text-gray-300">
                        Purpose <span className="text-red-500">*</span>
                    </Label>
                    {isPurposeModified && (
                        <Badge variant="outline" className="text-xs text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                            Modified
                        </Badge>
                    )}
                </div>
                <Select
                    value={formData.purpose}
                    onValueChange={(value) => onSelectChange('purpose', value)}
                    disabled={isSubmitting}
                >
                    <SelectTrigger className={`${errors.purpose ? 'border-destructive' : ''} dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300`}>
                        <SelectValue placeholder="Select purpose" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                        {safePurposeOptions.map((purpose, index) => (
                            <SelectItem key={index} value={purpose} className="dark:text-gray-300 dark:focus:bg-gray-700">
                                {purpose}
                            </SelectItem>
                        ))}
                        <SelectItem value="other" className="dark:text-gray-300 dark:focus:bg-gray-700">Other (specify below)</SelectItem>
                    </SelectContent>
                </Select>
                {formData.purpose === 'other' && (
                    <Input
                        name="purpose"
                        placeholder="Please specify purpose..."
                        onChange={onInputChange}
                        className="mt-2 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                        disabled={isSubmitting}
                    />
                )}
                {errors.purpose && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.purpose}</p>
                )}
                {originalPurpose && isPurposeModified && (
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                        Original: {originalPurpose}
                    </p>
                )}
            </div>

            {/* Specific Purpose */}
            <div className="space-y-2">
                <Label htmlFor="specific_purpose" className="dark:text-gray-300">Specific Purpose Details (Optional)</Label>
                <Textarea
                    id="specific_purpose"
                    name="specific_purpose"
                    value={formData.specific_purpose}
                    onChange={onInputChange}
                    placeholder="Provide more specific details about the purpose..."
                    rows={2}
                    className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                    disabled={isSubmitting}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    Additional details to help process your request
                </p>
            </div>

            {/* Additional Requirements */}
            <div className="space-y-2">
                <Label htmlFor="additional_requirements" className="dark:text-gray-300">Additional Requirements/Special Requests</Label>
                <Textarea
                    id="additional_requirements"
                    name="additional_requirements"
                    value={formData.additional_requirements}
                    onChange={onInputChange}
                    placeholder="Any special requirements or additional documents needed..."
                    rows={3}
                    className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                    disabled={isSubmitting}
                />
            </div>

            {/* Fee Amount */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="fee_amount" className="dark:text-gray-300">Fee Amount</Label>
                    {selectedClearanceType?.requires_payment && formData.urgency !== 'normal' && (
                        <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                            Includes surcharge
                        </Badge>
                    )}
                </div>
                <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <Input
                        id="fee_amount"
                        name="fee_amount"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.fee_amount}
                        onChange={onInputChange}
                        className="pl-10 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                        readOnly={selectedClearanceType !== null}
                        disabled={isSubmitting}
                    />
                </div>
                <div className="flex items-center justify-between text-xs">
                    <p className="text-gray-500 dark:text-gray-400">
                        {selectedClearanceType?.requires_payment ?
                            "Fee includes urgency surcharge if applicable" :
                            "Free service - no payment required"}
                    </p>
                    {selectedClearanceType && (
                        <p className="text-gray-500 dark:text-gray-400">
                            Base: {formatCurrency(selectedClearanceType.fee)}
                        </p>
                    )}
                </div>
            </div>

            {/* Info Card */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div className="flex-1">
                        <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">📋 Request Information</h4>
                        <ul className="list-disc list-inside space-y-1 text-xs text-blue-700 dark:text-blue-300">
                            <li>Select the appropriate clearance type for your needs</li>
                            <li>Rush and express processing add surcharges but reduce waiting time</li>
                            <li>Provide accurate purpose for proper documentation</li>
                            <li>Additional requirements may be requested during processing</li>
                            <li>Once submitted, you'll receive updates on your request status</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}