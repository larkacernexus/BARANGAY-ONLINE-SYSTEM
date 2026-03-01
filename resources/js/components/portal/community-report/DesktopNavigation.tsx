// components/community-report/DesktopNavigation.tsx

import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Save, Send, Loader2 } from 'lucide-react';

interface DesktopNavigationProps {
    activeStep: number;
    onPrevStep: () => void;
    onNextStep: () => void;
    onSubmit: () => void;
    onSaveDraft: () => void;
    isSavingDraft: boolean;
    isSubmitting: boolean;
    processing: boolean;
    canProceed: {
        step1: boolean;
        step2: boolean;
        step3: boolean;
    };
    selectedTypeRequiresEvidence: boolean;
    evidenceCount: number;
}

export const DesktopNavigation: React.FC<DesktopNavigationProps> = ({
    activeStep,
    onPrevStep,
    onNextStep,
    onSubmit,
    onSaveDraft,
    isSavingDraft,
    isSubmitting,
    processing,
    canProceed,
    selectedTypeRequiresEvidence,
    evidenceCount
}) => {
    const isStep1Valid = canProceed.step1;
    const isStep2Valid = canProceed.step2;
    const isStep3Valid = selectedTypeRequiresEvidence ? evidenceCount > 0 : true;

    const getNextStepDisabled = () => {
        if (activeStep === 1 && !isStep1Valid) return true;
        if (activeStep === 2 && !isStep2Valid) return true;
        if (activeStep === 3 && !isStep3Valid) return true;
        return false;
    };

    return (
        <div className="sticky bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent dark:from-gray-900 dark:via-gray-900 pt-6 border-t dark:border-gray-800 z-30">
            <div className="px-6 pb-6">
                <div className="flex items-center justify-between max-w-4xl mx-auto">
                    <div className="flex items-center gap-4">
                        {activeStep > 1 ? (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onPrevStep}
                                className="gap-2 px-6"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Previous
                            </Button>
                        ) : (
                            <Link href="/resident/community-reports">
                                <Button type="button" variant="outline" className="px-6">
                                    Cancel
                                </Button>
                            </Link>
                        )}
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onSaveDraft}
                            disabled={isSavingDraft}
                            className="gap-2"
                        >
                            <Save className="h-4 w-4" />
                            {isSavingDraft ? 'Saving...' : 'Save Draft'}
                        </Button>
                    </div>
                    <div className="flex items-center gap-4">
                        {activeStep < 4 ? (
                            <Button
                                type="button"
                                onClick={onNextStep}
                                className="gap-2 px-6"
                                disabled={getNextStepDisabled()}
                            >
                                Next Step
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        ) : (
                            <Button 
                                type="button"
                                size="lg" 
                                className="px-8 gap-2"
                                onClick={onSubmit}
                                disabled={isSubmitting || processing}
                            >
                                <Send className="h-4 w-4" />
                                {isSubmitting ? 'Submitting...' : 'Submit Report'}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};