import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { CheckCircle, Circle } from 'lucide-react';

interface ProgressIndicatorProps {
    step: number;
    onStepClick?: (step: number) => void;
}

export function ProgressIndicator({ step, onStepClick }: ProgressIndicatorProps) {
    const progressPercentage = () => {
        if (step === 1) return 33;
        if (step === 2) return 66;
        return 100;
    };

    const stepDescriptions = [
        { number: 1, title: 'Select Payer', description: 'Choose who is making the payment' },
        { number: 2, title: 'Add Fees', description: 'Select barangay fees and services' },
        { number: 3, title: 'Payment Details', description: 'Complete payment information' },
    ];

    const isStepClickable = (stepNumber: number) => {
        // Steps are clickable only when:
        // 1. In step 3, all steps are clickable
        // 2. In step 2, only steps 1 and 2 are clickable
        // 3. In step 1, only step 1 is clickable
        if (step >= 3) return true; // In step 3, all steps are clickable
        if (step === 2) return stepNumber <= 2; // In step 2, only steps 1 and 2
        return stepNumber === 1; // In step 1, only step 1
    };

    const handleStepClick = (stepNumber: number) => {
        if (isStepClickable(stepNumber) && onStepClick && stepNumber !== step) {
            onStepClick(stepNumber);
        }
    };

    return (
        <Card>
            <CardContent className="pt-6">
                <div className="space-y-4">
                    <div className="flex justify-between items-center mb-2">
                        <div>
                            <h3 className="font-medium">Payment Process</h3>
                            <p className="text-sm text-gray-500">
                                Step {step} of 3: {stepDescriptions[step - 1].description}
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold">{progressPercentage()}%</div>
                            <div className="text-xs text-gray-500">Complete</div>
                        </div>
                    </div>
                    <Progress value={progressPercentage()} className="h-2" />
                    <div className="grid grid-cols-3 gap-4 mt-4">
                        {stepDescriptions.map((stepDesc) => {
                            const isCompleted = step > stepDesc.number;
                            const isCurrent = step === stepDesc.number;
                            const clickable = isStepClickable(stepDesc.number);
                            
                            return (
                                <Button
                                    key={stepDesc.number}
                                    type="button"
                                    variant="ghost"
                                    className={`text-center p-3 rounded-lg border h-auto flex flex-col items-center justify-center transition-all ${
                                        isCurrent
                                            ? 'border-primary bg-primary/5 text-primary cursor-default'
                                            : isCompleted
                                            ? 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
                                            : clickable
                                            ? 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 cursor-pointer'
                                            : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                                    }`}
                                    onClick={() => handleStepClick(stepDesc.number)}
                                    disabled={!clickable || isCurrent}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        {isCompleted ? (
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                        ) : isCurrent ? (
                                            <Circle className="h-4 w-4 text-primary fill-current" />
                                        ) : (
                                            <Circle className="h-4 w-4 text-gray-300" />
                                        )}
                                        <div className="font-medium">Step {stepDesc.number}</div>
                                    </div>
                                    <div className="text-sm">{stepDesc.title}</div>
                                    {!clickable && stepDesc.number > step && (
                                        <div className="text-xs text-gray-400 mt-1">
                                            Complete current step first
                                        </div>
                                    )}
                                </Button>
                            );
                        })}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}