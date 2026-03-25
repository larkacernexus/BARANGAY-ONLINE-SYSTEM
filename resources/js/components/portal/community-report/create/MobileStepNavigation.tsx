// components/community-report/MobileStepNavigation.tsx

import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';

interface MobileStepNavigationProps {
    activeStep: number;
    isButtonsVisible: boolean;
    onPrevStep: () => void;
    onNextStep: () => void;
    onSubmit: () => void;
    isSubmitting: boolean;
    processing: boolean;
    canProceed: {
        step1: boolean;
        step2: boolean;
        step3: boolean;
    };
    selectedTypeRequiresEvidence: boolean;
    evidenceCount: number;
    anonymous: boolean;
    reporterName: string;
    reporterContact: string;
}

export const MobileStepNavigation: React.FC<MobileStepNavigationProps> = ({
    activeStep,
    isButtonsVisible,
    onPrevStep,
    onNextStep,
    onSubmit,
    isSubmitting,
    processing,
    canProceed,
    selectedTypeRequiresEvidence,
    evidenceCount,
    anonymous,
    reporterName,
    reporterContact
}) => {
    const isStep1Valid = canProceed.step1;
    const isStep2Valid = canProceed.step2;
    const isStep3Valid = selectedTypeRequiresEvidence ? evidenceCount > 0 : true;

    const getStepDisabled = () => {
        if (activeStep === 1 && !isStep1Valid) return true;
        if (activeStep === 2 && !isStep2Valid) return true;
        if (activeStep === 3 && !isStep3Valid) return true;
        return false;
    };

    const isSubmitDisabled = () => {
        if (processing || isSubmitting) return true;
        if (selectedTypeRequiresEvidence && evidenceCount === 0) return true;
        if (!anonymous && (!reporterName?.trim() || !reporterContact?.trim())) return true;
        return false;
    };

    const handleSubmitClick = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent any default button behavior
        console.log('Submit button clicked, calling onSubmit...');
        onSubmit();
    };

    const stepDisabled = getStepDisabled();
    const submitDisabled = isSubmitDisabled();

    return (
        <div className={`fixed bottom-16 left-0 right-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 p-4 transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-lg ${
            isButtonsVisible 
                ? "translate-y-0 opacity-100" 
                : "translate-y-full opacity-0"
        }`}>
            <div className="flex items-center justify-between gap-3">
                {activeStep > 1 ? (
                    <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={onPrevStep}
                    >
                        Back
                    </Button>
                ) : (
                    <Link href="/resident/community-reports" className="flex-1">
                        <Button type="button" variant="outline" className="w-full">
                            Cancel
                        </Button>
                    </Link>
                )}
                
                {activeStep < 4 ? (
                    <Button
                        type="button"
                        className="flex-1"
                        onClick={onNextStep}
                        disabled={stepDisabled}
                    >
                        Continue
                    </Button>
                ) : (
                    <Button 
                        type="button" // Keep as button, but we'll handle submission manually
                        className={`flex-1 ${submitDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={handleSubmitClick}
                        disabled={submitDisabled}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            'Submit Report'
                        )}
                    </Button>
                )}
            </div>
            {activeStep === 4 && (
                <div className="text-center mt-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        {submitDisabled ? (
                            <>
                                {!anonymous && (!reporterName?.trim() || !reporterContact?.trim()) 
                                    ? 'Please provide your contact information'
                                    : selectedTypeRequiresEvidence && evidenceCount === 0
                                    ? 'Evidence is required for this report'
                                    : 'Complete all required fields'
                                }
                            </>
                        ) : (
                            anonymous 
                                ? 'Ready to submit anonymously'
                                : 'Ready to submit your report'
                        )}
                    </p>
                </div>
            )}
        </div>
    );
};