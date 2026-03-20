// components/records/MobileNavDrawer.tsx

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Check } from 'lucide-react';
import { MobileNavDrawerProps } from '@/types/portal/records/records';

export function MobileNavDrawer({ isOpen, onClose, currentStep, totalSteps, steps }: MobileNavDrawerProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-[280px] bg-white dark:bg-gray-900 shadow-xl animate-in slide-in-from-right duration-300">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b dark:border-gray-800">
            <h3 className="font-semibold dark:text-white">Upload Steps</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Steps */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {steps.map((step, index) => {
                const stepNumber = index + 1;
                const isCurrent = currentStep === stepNumber;
                const isCompleted = stepNumber < currentStep;
                
                return (
                  <div
                    key={step.title}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      isCurrent 
                        ? 'bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' 
                        : isCompleted
                        ? 'bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800'
                        : 'bg-gray-50 border border-gray-200 dark:bg-gray-900 dark:border-gray-700'
                    }`}
                  >
                    <div className={`
                      flex items-center justify-center w-8 h-8 rounded-full border-2 flex-shrink-0
                      ${isCurrent 
                        ? 'bg-blue-600 border-blue-600 text-white' 
                        : isCompleted
                        ? 'bg-green-600 border-green-600 text-white'
                        : 'border-gray-300 text-gray-500 dark:border-gray-600 dark:text-gray-400'
                      }
                    `}>
                      {isCompleted ? <Check className="h-5 w-5" /> : stepNumber}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {step.icon}
                        <span className={`font-medium truncate ${
                          isCurrent ? 'text-blue-700 dark:text-blue-300' : 
                          isCompleted ? 'text-green-700 dark:text-green-300' : 
                          'text-gray-700 dark:text-gray-300'
                        }`}>
                          {step.title}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {isCurrent ? 'Current step' : isCompleted ? 'Completed' : 'Upcoming'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Quick Stats */}
            <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <h4 className="font-medium text-sm mb-2 dark:text-white">Quick Stats</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Progress</span>
                  <span className="font-medium dark:text-white">{currentStep}/{totalSteps}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Status</span>
                  <Badge variant={currentStep === totalSteps ? "default" : "outline"}>
                    {currentStep === totalSteps ? 'Ready to upload' : 'In progress'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="p-4 border-t dark:border-gray-800">
            <Button
              variant="outline"
              className="w-full dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
              onClick={onClose}
            >
              Close Menu
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}