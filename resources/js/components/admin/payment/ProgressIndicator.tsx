// resources/js/components/admin/payment/ProgressIndicator.tsx

import React from 'react';
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
        if (step >= 3) return true;
        if (step === 2) return stepNumber <= 2;
        return stepNumber === 1;
    };

    const handleStepClick = (stepNumber: number) => {
        if (isStepClickable(stepNumber) && onStepClick && stepNumber !== step) {
            onStepClick(stepNumber);
        }
    };

    return (
        <Card className="dark:bg-gray-900">
            <CardContent className="pt-6">
                <div className="space-y-4">
                    <div className="flex justify-between items-center mb-2">
                        <div>
                            <h3 className="font-medium dark:text-gray-100">Payment Process</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Step {step} of 3: {stepDescriptions[step - 1].description}
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold dark:text-gray-100">{progressPercentage()}%</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Complete</div>
                        </div>
                    </div>
                    
                    <Progress 
                        value={progressPercentage()} 
                        className="h-2 dark:bg-gray-700" 
                        indicatorClassName="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700"
                    />
                    
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
                                    className={`text-center p-3 rounded-lg border h-auto flex flex-col items-center justify-center ${
                                        isCurrent
                                            ? 'border-primary bg-primary/5 text-primary dark:border-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                                            : isCompleted
                                            ? 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30'
                                            : clickable
                                            ? 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-900 dark:text-gray-300'
                                            : 'border-gray-200 bg-gray-50 text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-500 cursor-not-allowed'
                                    }`}
                                    onClick={() => handleStepClick(stepDesc.number)}
                                    disabled={!clickable || isCurrent}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        {isCompleted ? (
                                            <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />
                                        ) : isCurrent ? (
                                            <Circle className="h-4 w-4 text-primary fill-current dark:text-blue-400" />
                                        ) : (
                                            <Circle className="h-4 w-4 text-gray-300 dark:text-gray-600" />
                                        )}
                                        <div className="font-medium dark:text-gray-200">Step {stepDesc.number}</div>
                                    </div>
                                    <div className="text-sm dark:text-gray-400">{stepDesc.title}</div>
                                </Button>
                            );
                        })}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}