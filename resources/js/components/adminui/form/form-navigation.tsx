// components/ui/form/form-navigation.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronRight, Save, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormNavigationProps {
    onPrevious?: () => void;
    onNext?: () => void;
    onCancel: () => void;
    onSubmit: () => void; // Changed to not accept event parameter
    isSubmitting: boolean;
    isSubmittable: boolean;
    showPrevious?: boolean;
    showNext?: boolean;
    previousLabel?: string;
    nextLabel?: string;
    cancelLabel?: string;
    submitLabel?: string;
    className?: string;
}

export function FormNavigation({
    onPrevious,
    onNext,
    onCancel,
    onSubmit,
    isSubmitting,
    isSubmittable,
    showPrevious = true,
    showNext = true,
    previousLabel = "Back",
    nextLabel = "Next",
    cancelLabel = "Cancel",
    submitLabel = "Save Changes",
    className
}: FormNavigationProps) {
    return (
        <div className={cn("flex justify-between", className)}>
            <div>
                {showPrevious && onPrevious && (
                    <Button 
                        type="button" 
                        variant="outline" 
                        onClick={onPrevious} 
                        className="gap-2 dark:border-gray-600 dark:text-gray-300"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        {previousLabel}
                    </Button>
                )}
            </div>
            <div className="flex gap-2">
                <Button
                    variant="outline"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    type="button"
                    className="dark:border-gray-600 dark:text-gray-300"
                >
                    <X className="h-4 w-4 mr-2" />
                    {cancelLabel}
                </Button>
                <Button
                    onClick={onSubmit} // No event parameter needed
                    disabled={isSubmitting || !isSubmittable}
                    className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white dark:from-emerald-700 dark:to-teal-700"
                    type="button"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Submitting...
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4" />
                            {submitLabel}
                        </>
                    )}
                </Button>
                {showNext && onNext && (
                    <Button type="button" onClick={onNext} className="gap-2">
                        {nextLabel}
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    );
}