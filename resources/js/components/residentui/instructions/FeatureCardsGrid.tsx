// /components/residentui/instructions/FeatureCardsGrid.tsx
import React from 'react';
import { LucideIcon, Sparkles } from 'lucide-react';

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
}

interface FeatureCardsGridProps {
  title: string;
  features: Feature[];
  headerIcon?: LucideIcon; // Optional header icon
  bgColor?: string;
}

export const FeatureCardsGrid: React.FC<FeatureCardsGridProps> = ({ 
  title, 
  features, 
  headerIcon: HeaderIcon = Sparkles, // Default to Sparkles if not provided
  bgColor = "from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20" 
}) => {
  return (
    <div className={`rounded-lg bg-gradient-to-r ${bgColor} p-4 sm:p-6`}>
      <h3 className="mb-3 sm:mb-4 flex items-center gap-1 sm:gap-2 text-base sm:text-lg font-semibold text-green-900 dark:text-green-300 break-words">
        <HeaderIcon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
        {title}
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
        {features.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <div key={idx} className="rounded-lg bg-white p-3 sm:p-4 dark:bg-gray-900">
              <Icon className={`mb-1 sm:mb-2 h-4 w-4 sm:h-5 sm:w-5 text-${feature.color}-600 flex-shrink-0`} />
              <h4 className={`text-xs sm:text-sm font-medium text-${feature.color}-800 dark:text-${feature.color}-400 break-words`}>
                {feature.title}
              </h4>
              <p className="mt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400 break-words">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};