// /components/residentui/instructions/StepsGuide.tsx
import React from 'react';
import { CheckCircle } from 'lucide-react';

interface Step {
  step: number;
  title: string;
  description: string;
}

interface StepsGuideProps {
  title: string;
  steps: Step[];
}

export const StepsGuide: React.FC<StepsGuideProps> = ({ title, steps }) => {
  return (
    <div className="rounded-lg border border-gray-200 p-4 sm:p-6 dark:border-gray-700">
      <h3 className="mb-3 sm:mb-4 text-sm sm:text-lg font-semibold text-gray-900 dark:text-white break-words">{title}</h3>
      <div className="space-y-3 sm:space-y-4">
        {steps.map((item) => (
          <div key={item.step} className="flex gap-2 sm:gap-3">
            <div className="flex h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-600 text-[10px] sm:text-xs text-white">
              {item.step}
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white break-words">{item.title}</h4>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 break-words">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};