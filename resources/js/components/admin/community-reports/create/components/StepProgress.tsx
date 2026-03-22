// components/community-report/StepProgress.tsx
import { Progress } from '@/components/ui/progress';
import { Check } from 'lucide-react';

interface Step {
    number: number;
    title: string;
    description: string;
    icon: React.ElementType;
}

interface StepProgressProps {
    steps: Step[];
    activeStep: number;
    onStepClick: (step: number) => void;
}

export const StepProgress = ({ steps, activeStep, onStepClick }: StepProgressProps) => {
    return (
        <div className="mb-8">
            <div className="flex items-center justify-between gap-2">
                {steps.map((step) => (
                    <button
                        key={step.number}
                        type="button"
                        onClick={() => onStepClick(step.number)}
                        className={`flex-1 relative group transition-all duration-200 ${
                            activeStep === step.number 
                                ? 'cursor-pointer' 
                                : 'cursor-pointer hover:opacity-80'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                                step.number < activeStep
                                    ? 'bg-green-500 text-white'
                                    : step.number === activeStep
                                    ? 'bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900/30'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                            }`}>
                                {step.number < activeStep ? (
                                    <Check className="h-5 w-5" />
                                ) : (
                                    <step.icon className="h-5 w-5" />
                                )}
                            </div>
                            <div className="hidden md:block text-left">
                                <p className={`text-sm font-medium ${
                                    step.number <= activeStep 
                                        ? 'text-gray-900 dark:text-gray-100' 
                                        : 'text-gray-400 dark:text-gray-500'
                                }`}>
                                    Step {step.number}
                                </p>
                                <p className={`text-xs ${
                                    step.number <= activeStep 
                                        ? 'text-gray-600 dark:text-gray-400' 
                                        : 'text-gray-400 dark:text-gray-500'
                                }`}>
                                    {step.title}
                                </p>
                            </div>
                        </div>
                        {step.number < steps.length && (
                            <div className={`absolute top-5 left-16 right-0 h-0.5 ${
                                step.number < activeStep 
                                    ? 'bg-green-500' 
                                    : 'bg-gray-200 dark:bg-gray-700'
                            }`} />
                        )}
                    </button>
                ))}
            </div>
            <div className="mt-4">
                <Progress value={(activeStep / steps.length) * 100} className="h-2 bg-gray-200 dark:bg-gray-700" />
                <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>Basic Info</span>
                    <span>Report Details</span>
                    <span>Review & Submit</span>
                </div>
            </div>
        </div>
    );
};