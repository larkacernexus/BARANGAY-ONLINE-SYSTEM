// components/admin/fee-types/create/applicability-tab.tsx
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Users, MapPin } from 'lucide-react';

interface ApplicabilityTabProps {
    formData: any;
    errors: Record<string, string>;
    applicableTo: Record<string, string>;
    puroks: string[];
    selectedPuroks: string[];
    onSelectChange: (name: string, value: string) => void;
    onPurokChange: (purok: string, checked: boolean) => void;
    isSubmitting: boolean;
}

export function ApplicabilityTab({
    formData,
    errors,
    applicableTo,
    puroks,
    selectedPuroks,
    onSelectChange,
    onPurokChange,
    isSubmitting
}: ApplicabilityTabProps) {
    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="applicable_to" className="dark:text-gray-300">Applicable To</Label>
                <Select
                    value={formData.applicable_to}
                    onValueChange={(value) => onSelectChange('applicable_to', value)}
                    disabled={isSubmitting}
                >
                    <SelectTrigger className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                        {Object.entries(applicableTo).map(([value, label]) => (
                            <SelectItem key={value} value={value} className="dark:text-gray-300 dark:focus:bg-gray-700">
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    {label as string}
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {formData.applicable_to === 'specific_purok' && (
                <div className="space-y-2">
                    <Label className="dark:text-gray-300 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Select Puroks
                    </Label>
                    <div className="space-y-2 max-h-40 overflow-y-auto p-3 border rounded-md dark:border-gray-700">
                        {puroks.length === 0 ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                                No puroks available
                            </p>
                        ) : (
                            puroks.map((purok: string, index: number) => (
                                <div key={index} className="flex items-center space-x-2 p-1 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                                    <Checkbox
                                        id={`purok-${index}`}
                                        checked={selectedPuroks.includes(purok)}
                                        onCheckedChange={(checked) => onPurokChange(purok, checked as boolean)}
                                        disabled={isSubmitting}
                                    />
                                    <Label htmlFor={`purok-${index}`} className="text-sm cursor-pointer dark:text-gray-300">
                                        {purok}
                                    </Label>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Help text */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div className="flex-1">
                        <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">👥 Applicability</h4>
                        <ul className="list-disc list-inside space-y-1 text-xs text-blue-700 dark:text-blue-300">
                            <li><strong>All Residents:</strong> Fee applies to everyone in the barangay</li>
                            <li><strong>Business Owners:</strong> Only applies to registered businesses</li>
                            <li><strong>Specific Purok:</strong> Only residents in selected puroks</li>
                            <li><strong>Specific Residents:</strong> Only named individuals (e.g., franchise holders)</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}