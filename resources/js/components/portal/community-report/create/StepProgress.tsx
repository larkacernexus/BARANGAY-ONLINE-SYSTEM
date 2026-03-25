// components/community-report/StepProgress.tsx

import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { steps } from '@/types/portal/communityreports/utils/community-report-helpers';
import { AlertCircle, FileText, Camera, CheckCircle } from 'lucide-react';

interface StepProgressProps {
    activeStep: number;
    isMobile: boolean;
    currentDraftId: string | null;
}

const iconMap = {
    'AlertCircle': AlertCircle,
    'FileText': FileText,
    'Camera': Camera,
    'CheckCircle': CheckCircle
};

export const StepProgress: React.FC<StepProgressProps> = ({ activeStep, isMobile, currentDraftId }) => {
    if (isMobile) {
        return (
            <div className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
                <div className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                                <h1 className="text-lg font-bold truncate">Submit Report</h1>
                                {currentDraftId && (
                                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                        Draft Saved
                                    </Badge>
                                )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <Progress value={(activeStep / 4) * 100} className="h-1.5 flex-1" />
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                    Step {activeStep} of 4
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-2xl font-bold">
                        Step {activeStep}: {steps[activeStep - 1].title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        {steps[activeStep - 1].description}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        Step {activeStep} of {steps.length}
                    </Badge>
                </div>
            </div>
            <Progress value={(activeStep / steps.length) * 100} className="h-2" />
        </div>
    );
};