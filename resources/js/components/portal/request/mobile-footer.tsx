import { Link } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileFooterProps {
    isButtonsVisible: boolean;
    activeStep: number;
    dataClearanceTypeId: string;
    dataPurpose: string;
    isCustomPurpose: boolean;
    requiresDocuments: boolean;
    documentRequirements: any;
    processing: boolean;
    isFormValid: boolean;
    onPrev: () => void;
    onNext: () => void;
    onSubmit: () => void;
}

export function MobileFooter({
    isButtonsVisible,
    activeStep,
    dataClearanceTypeId,
    dataPurpose,
    isCustomPurpose,
    requiresDocuments,
    documentRequirements,
    processing,
    isFormValid,
    onPrev,
    onNext,
    onSubmit
}: MobileFooterProps) {
    return (
        <div className={`fixed bottom-16 left-0 right-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 p-4 transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-lg ${
            isButtonsVisible 
                ? "translate-y-0 opacity-100" 
                : "translate-y-full opacity-0"
        }`}>
            <div className="flex items-center justify-between gap-3">
                {activeStep > 1 ? (
                    <Button type="button" variant="outline" className="flex-1" onClick={onPrev}>
                        Back
                    </Button>
                ) : (
                    <Link href="/resident/clearances" className="flex-1">
                        <Button type="button" variant="outline" className="w-full">
                            Cancel
                        </Button>
                    </Link>
                )}
                
                {activeStep < 4 ? (
                    <Button
                        type="button"
                        className="flex-1"
                        onClick={onNext}
                        disabled={
                            (activeStep === 1 && !dataClearanceTypeId) ||
                            (activeStep === 2 && (!dataPurpose && !isCustomPurpose)) ||
                            (activeStep === 3 && requiresDocuments && documentRequirements.requiredCount > 0 && !documentRequirements.met)
                        }
                    >
                        Continue
                    </Button>
                ) : (
                    <Button 
                        type="button"
                        className="flex-1" 
                        onClick={onSubmit}
                        disabled={processing || !isFormValid}
                    >
                        {processing ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            'Submit Request'
                        )}
                    </Button>
                )}
            </div>
            {activeStep === 4 && (
                <div className="text-center mt-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        {isFormValid 
                            ? 'Ready to submit your clearance request'
                            : 'Please complete all required fields'
                        }
                    </p>
                </div>
            )}
        </div>
    );
}