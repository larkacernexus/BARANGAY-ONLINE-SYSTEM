interface Step {
    id: number;
    title: string;
    description: string;
    icon: any;
}

interface StepNavigationProps {
    isMobile: boolean;
    steps: Step[];
    activeStep: number;
    onStepChange: (step: number) => void;
}

export function StepNavigation({ isMobile, steps, activeStep, onStepChange }: StepNavigationProps) {
    if (!isMobile) return null;

    return (
        <div className="flex justify-between mb-6 overflow-x-auto py-2">
            {steps.map((step) => {
                const Icon = step.icon;
                return (
                    <button
                        key={step.id}
                        type="button"
                        className={`flex flex-col items-center px-3 py-2 rounded-lg transition-colors ${
                            activeStep === step.id 
                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                                : 'text-gray-500 dark:text-gray-400'
                        }`}
                        onClick={() => onStepChange(step.id)}
                    >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-1 ${
                            activeStep === step.id 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-200 dark:bg-gray-800'
                        }`}>
                            {step.id}
                        </div>
                        <span className="text-xs font-medium whitespace-nowrap">{step.title}</span>
                    </button>
                );
            })}
        </div>
    );
}