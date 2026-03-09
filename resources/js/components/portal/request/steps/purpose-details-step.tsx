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
    getPurposeSuggestions: () => string;
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
    return (
        <div className="space-y-6">
            <Card className="rounded-xl">
                <CardContent className="p-4 lg:p-6 pt-6 space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="purpose" className="text-sm font-medium">Purpose of Clearance *</Label>
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
                                <p className="text-sm text-red-600">{errors.purpose}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="specific_purpose" className="text-sm font-medium flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Specific Details 
                                <span className="text-gray-400 ml-1 font-normal">(Optional)</span>
                            </Label>
                            <Textarea
                                id="specific_purpose"
                                value={data.specific_purpose}
                                onChange={e => setData('specific_purpose', e.target.value)}
                                placeholder={getPurposeSuggestions()}
                                rows={3}
                                disabled={!data.purpose && !isCustomPurpose}
                                className="text-sm min-h-[80px] rounded-lg"
                            />
                            <div className="flex justify-between items-center">
                                <p className="text-xs text-gray-500">
                                    Be specific about where and why
                                </p>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        const suggestion = getPurposeSuggestions();
                                        if (suggestion) {
                                            setData('specific_purpose', suggestion);
                                        }
                                    }}
                                    className="text-xs h-7 px-3"
                                    disabled={!data.purpose && !isCustomPurpose}
                                >
                                    Auto-fill
                                </Button>
                            </div>
                            {errors.specific_purpose && (
                                <p className="text-sm text-red-600">{errors.specific_purpose}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="needed_date" className="text-sm font-medium flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Date Needed *
                                </Label>
                                <Input
                                    id="needed_date"
                                    type="date"
                                    value={data.needed_date}
                                    onChange={e => setData('needed_date', e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    required
                                    className="h-11 text-sm rounded-lg"
                                />
                                {errors.needed_date && (
                                    <p className="text-sm text-red-600">{errors.needed_date}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="additional_notes" className="text-sm font-medium flex items-center gap-2">
                                    <Info className="h-4 w-4" />
                                    Additional Notes
                                </Label>
                                <Input
                                    id="additional_notes"
                                    value={data.additional_notes}
                                    onChange={e => setData('additional_notes', e.target.value)}
                                    placeholder="Special requirements..."
                                    className="h-11 text-sm rounded-lg"
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}