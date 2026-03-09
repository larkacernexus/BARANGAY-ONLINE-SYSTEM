import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface Step {
    id: number;
    title: string;
    description: string;
    icon: any;
}

interface StepProgressProps {
    isMobile: boolean;
    steps: Step[];
    activeStep: number;
}

export function StepProgress({ isMobile, steps, activeStep }: StepProgressProps) {
    if (isMobile) return null;

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
}