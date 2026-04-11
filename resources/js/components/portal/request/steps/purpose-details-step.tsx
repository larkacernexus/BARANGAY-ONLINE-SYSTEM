import { FileText, Calendar, Info, Sparkles, ArrowRight, CheckCircle2, Lightbulb } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { PurposeDropdown } from '@/components/resident/request/purpose-dropdown';
import type { FormData } from '@/components/portal/request/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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
    const currentPurpose = isCustomPurpose ? data.purpose_custom : data.purpose;
    const suggestionText = getPurposeSuggestions(currentPurpose, isCustomPurpose);
    const hasPurposeSelected = data.purpose !== '' || (isCustomPurpose && data.purpose_custom !== '');
    
    const hasHelpfulSuggestion = suggestionText && 
        suggestionText !== 'Please provide specific details about your purpose for this clearance request.' &&
        suggestionText !== 'Please provide specific details about your purpose for this clearance.' &&
        suggestionText !== '';
    
    const handleAutoFill = () => {
        if (hasPurposeSelected) {
            if (hasHelpfulSuggestion) {
                setData('specific_purpose', suggestionText);
                toast.success('Template added! You can edit it as needed.', {
                    icon: '✨',
                    duration: 3000,
                });
            } else {
                toast.info('Please provide your own specific details for this purpose.', {
                    icon: '💡',
                    duration: 3000,
                });
            }
        } else {
            toast.warning('Please select a purpose first', {
                icon: '⚠️',
                duration: 3000,
            });
        }
    };

    const handleClearSpecificDetails = () => {
        setData('specific_purpose', '');
        toast.info('Specific details cleared', {
            icon: '🗑️',
            duration: 2000,
        });
    };

    return (
        <div className="space-y-6">
            <Card className="rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm transition-all duration-300 hover:shadow-md">
                <CardContent className="p-4 lg:p-6 pt-6 space-y-6">
                    <div className="space-y-4">
                        {/* Purpose Selection */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <span className="text-red-500">*</span>
                                Purpose of Clearance
                                {hasPurposeSelected && (
                                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500 animate-scale-in" />
                                )}
                            </Label>
                            <div className="transition-all duration-300">
                                <PurposeDropdown
                                    value={data.purpose}
                                    purposeCustom={data.purpose_custom}
                                    isCustomPurpose={isCustomPurpose}
                                    availablePurposes={availablePurposes}
                                    purposeSearch={purposeSearch}
                                    showPurposeDropdown={showPurposeDropdown}
                                    disabled={!selectedClearance}
                                    placeholder="Select or search purpose..."
                                    onSelect={onPurposeSelect}
                                    onCustomChange={(value) => setData('purpose_custom', value)}
                                    onSearchChange={setPurposeSearch}
                                    onToggleDropdown={setShowPurposeDropdown}
                                />
                            </div>
                            {errors.purpose && (
                                <p className="text-sm text-red-600 dark:text-red-400 animate-fade-in">
                                    {errors.purpose}
                                </p>
                            )}
                        </div>

                        {/* Specific Details */}
                        <div className="space-y-2">
                            <Label htmlFor="specific_purpose" className="text-sm font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 group-hover:scale-110" />
                                Specific Details 
                                <span className="text-gray-500 text-xs font-normal">(Optional but recommended)</span>
                                {data.specific_purpose && (
                                    <span className="text-[10px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded-full animate-fade-in">
                                        Added
                                    </span>
                                )}
                            </Label>
                            
                            <div className="relative">
                                <Textarea
                                    id="specific_purpose"
                                    value={data.specific_purpose || ''}
                                    onChange={e => setData('specific_purpose', e.target.value)}
                                    placeholder={!hasPurposeSelected 
                                        ? "✨ Select a purpose above first to enable this field" 
                                        : (hasHelpfulSuggestion 
                                            ? suggestionText 
                                            : "Be specific about where and why you need this clearance...")
                                    }
                                    rows={4}
                                    disabled={!hasPurposeSelected}
                                    className={cn(
                                        "text-sm min-h-[100px] rounded-lg transition-all duration-300 resize-y",
                                        hasPurposeSelected 
                                            ? "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 hover:border-blue-300 dark:hover:border-blue-600 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:shadow-md"
                                            : "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed",
                                        data.specific_purpose && "border-green-300 dark:border-green-700"
                                    )}
                                    onFocus={() => {
                                        if (!hasPurposeSelected) {
                                            toast.info('Please select a purpose first', {
                                                icon: 'ℹ️',
                                                duration: 2000,
                                            });
                                        }
                                    }}
                                />
                                
                                {!hasPurposeSelected && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-fade-in">
                                        <div className="bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 shadow-sm">
                                            <ArrowRight className="h-3 w-3" />
                                            Select purpose above
                                        </div>
                                    </div>
                                )}

                                {hasPurposeSelected && data.specific_purpose && (
                                    <button
                                        type="button"
                                        onClick={handleClearSpecificDetails}
                                        className="absolute bottom-3 right-3 p-1 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 hover:scale-110"
                                    >
                                        <svg className="h-3 w-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                            
                            {hasPurposeSelected && (
                                <div className="flex justify-between items-center mt-2">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                        <Lightbulb className="h-3 w-3 text-amber-500" />
                                        Add specific details to help process your request faster
                                    </p>
                                    {hasHelpfulSuggestion && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={handleAutoFill}
                                            className="text-xs h-8 px-3 transition-all duration-300 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:shadow-md hover:scale-105 active:scale-95"
                                        >
                                            <Sparkles className="h-3 w-3 mr-1 transition-transform duration-300 group-hover:rotate-12" />
                                            Auto-fill Template
                                        </Button>
                                    )}
                                </div>
                            )}

                            {hasHelpfulSuggestion && hasPurposeSelected && data.specific_purpose !== suggestionText && (
                                <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-lg border border-blue-100 dark:border-blue-800/50 animate-slide-down">
                                    <div className="flex items-start gap-2">
                                        <div className="p-1 rounded-full bg-blue-100 dark:bg-blue-900/30">
                                            <Sparkles className="h-3 w-3 text-blue-500 dark:text-blue-400" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">
                                                Template Suggestion
                                            </p>
                                            <p className="text-xs text-blue-600 dark:text-blue-400 leading-relaxed">
                                                {suggestionText}
                                            </p>
                                            <button
                                                onClick={handleAutoFill}
                                                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mt-2 flex items-center gap-1 transition-all duration-200 hover:gap-2"
                                            >
                                                Use this template <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {errors.specific_purpose && (
                                <p className="text-sm text-red-600 dark:text-red-400 animate-fade-in">
                                    {errors.specific_purpose}
                                </p>
                            )}
                        </div>

                        {/* Date and Notes */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="needed_date" className="text-sm font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                    <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 group-hover:scale-110" />
                                    Date Needed <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="needed_date"
                                    type="date"
                                    value={data.needed_date}
                                    onChange={e => setData('needed_date', e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    required
                                    className="h-11 text-sm rounded-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-300 dark:hover:border-blue-600"
                                />
                                {errors.needed_date && (
                                    <p className="text-sm text-red-600 dark:text-red-400 animate-fade-in">
                                        {errors.needed_date}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="additional_notes" className="text-sm font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                    <Info className="h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 group-hover:scale-110" />
                                    Additional Notes
                                </Label>
                                <Input
                                    id="additional_notes"
                                    value={data.additional_notes || ''}
                                    onChange={e => setData('additional_notes', e.target.value)}
                                    placeholder="Special requirements or instructions..."
                                    className="h-11 text-sm rounded-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 transition-all duration-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-300 dark:hover:border-blue-600"
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}