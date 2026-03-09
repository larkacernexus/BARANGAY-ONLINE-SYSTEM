import { Link } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Save, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DesktopFooterProps {
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
    onSaveDraft: () => void;
}

export function DesktopFooter({
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
    onSubmit,
    onSaveDraft
}: DesktopFooterProps) {
    return (
        <div className="sticky bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent dark:from-gray-900 dark:via-gray-900 pt-6 border-t dark:border-gray-800 z-30">
            <div className="px-6 pb-6">
                <div className="flex items-center justify-between max-w-4xl mx-auto">
                    <div className="flex items-center gap-4">
                        {activeStep > 1 ? (
                            <Button type="button" variant="outline" onClick={onPrev} className="gap-2 px-6">
                                <ArrowLeft className="h-4 w-4" />
                                Previous
                            </Button>
                        ) : (
                            <Link href="/resident/clearances">
                                <Button type="button" variant="outline" className="px-6">
                                    Cancel
                                </Button>
                            </Link>
                        )}
                        <Button type="button" variant="ghost" onClick={onSaveDraft} className="gap-2">
                            <Save className="h-4 w-4" />
                            Save Draft
                        </Button>
                    </div>
                    <div className="flex items-center gap-4">
                        {activeStep < 4 ? (
                            <Button
                                type="button"
                                onClick={onNext}
                                className="gap-2 px-6"
                                disabled={
                                    (activeStep === 1 && !dataClearanceTypeId) ||
                                    (activeStep === 2 && (!dataPurpose && !isCustomPurpose)) ||
                                    (activeStep === 3 && requiresDocuments && documentRequirements.requiredCount > 0 && !documentRequirements.met)
                                }
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
                                disabled={processing || !isFormValid}
                            >
                                <Send className="h-4 w-4" />
                                {processing ? 'Submitting...' : 'Submit Request'}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}