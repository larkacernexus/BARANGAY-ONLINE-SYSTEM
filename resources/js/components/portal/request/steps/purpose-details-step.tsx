import { FileText, Calendar, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { PurposeDropdown } from '@/components/resident/request/purpose-dropdown';
import type { FormData } from '@/components/resident/request/types';

interface PurposeDetailsStepProps {
    selectedClearance: any;
    data: FormData;
    setData: any;
    errors: Record<string, string>;
    availablePurposes: Array<{value: string, label: string, icon: any}>;
    isCustomPurpose: boolean;
    purposeSearch: string;
    setPurposeSearch: (search: string) => void;
    showPurposeDropdown: boolean;
    setShowPurposeDropdown: (show: boolean) => void;
    onPurposeSelect: (value: string, label: string) => void;
    // ✅ Fix: Accept a function that takes purpose and isCustom parameters
    getPurposeSuggestions: (purpose: string, isCustom: boolean) => string;
}

export function PurposeDetailsStep({
    selectedClearance,
    data,
    setData,
    errors,
    availablePurposes,
    isCustomPurpose,
    purposeSearch,
    setPurposeSearch,
    showPurposeDropdown,
    setShowPurposeDropdown,
    onPurposeSelect,
    getPurposeSuggestions
}: PurposeDetailsStepProps) {
    // Get the current purpose text
    const currentPurpose = isCustomPurpose ? data.purpose_custom : data.purpose;
    
    // Get suggestions based on current purpose
    const suggestionText = getPurposeSuggestions(currentPurpose, isCustomPurpose);

    return (
        <div className="space-y-6">
            <Card className="rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                <CardContent className="p-4 lg:p-6 pt-6 space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="purpose" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Purpose of Clearance *
                            </Label>
                            <PurposeDropdown
                                value={data.purpose}
                                purposeCustom={data.purpose_custom}
                                isCustomPurpose={isCustomPurpose}
                                availablePurposes={availablePurposes}
                                purposeSearch={purposeSearch}
                                showPurposeDropdown={showPurposeDropdown}
                                disabled={!selectedClearance}
                                onSelect={onPurposeSelect}
                                onCustomChange={(value) => setData('purpose_custom', value)}
                                onSearchChange={setPurposeSearch}
                                onToggleDropdown={setShowPurposeDropdown}
                            />
                            {errors.purpose && (
                                <p className="text-sm text-red-600 dark:text-red-400">{errors.purpose}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="specific_purpose" className="text-sm font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                Specific Details 
                                <span className="text-gray-500 dark:text-gray-500 ml-1 font-normal">(Optional)</span>
                            </Label>
                            <Textarea
                                id="specific_purpose"
                                value={data.specific_purpose}
                                onChange={e => setData('specific_purpose', e.target.value)}
                                placeholder={suggestionText}
                                rows={3}
                                disabled={!data.purpose && !isCustomPurpose}
                                className="text-sm min-h-[80px] rounded-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 disabled:bg-gray-50 dark:disabled:bg-gray-800/50 disabled:text-gray-500 dark:disabled:text-gray-500"
                            />
                            <div className="flex justify-between items-center">
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Be specific about where and why
                                </p>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        const suggestion = getPurposeSuggestions(currentPurpose, isCustomPurpose);
                                        if (suggestion) {
                                            setData('specific_purpose', suggestion);
                                        }
                                    }}
                                    className="text-xs h-7 px-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 disabled:text-gray-400 dark:disabled:text-gray-600"
                                    disabled={!data.purpose && !isCustomPurpose}
                                >
                                    Auto-fill
                                </Button>
                            </div>
                            {errors.specific_purpose && (
                                <p className="text-sm text-red-600 dark:text-red-400">{errors.specific_purpose}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="needed_date" className="text-sm font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                    <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                    Date Needed *
                                </Label>
                                <Input
                                    id="needed_date"
                                    type="date"
                                    value={data.needed_date}
                                    onChange={e => setData('needed_date', e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    required
                                    className="h-11 text-sm rounded-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 disabled:bg-gray-50 dark:disabled:bg-gray-800/50"
                                />
                                {errors.needed_date && (
                                    <p className="text-sm text-red-600 dark:text-red-400">{errors.needed_date}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="additional_notes" className="text-sm font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                    <Info className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                    Additional Notes
                                </Label>
                                <Input
                                    id="additional_notes"
                                    value={data.additional_notes}
                                    onChange={e => setData('additional_notes', e.target.value)}
                                    placeholder="Special requirements..."
                                    className="h-11 text-sm rounded-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}