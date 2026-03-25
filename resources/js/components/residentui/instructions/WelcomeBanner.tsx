// /components/residentui/instructions/WelcomeBanner.tsx
import React from 'react';
import { Shield, Calendar } from 'lucide-react';

interface WelcomeBannerProps {
  title: string;
  subtitle: string;
  badges?: Array<{ icon: React.ElementType; label: string }>;
}

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ 
  title, 
  subtitle, 
  badges = [] 
}) => {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-4 sm:p-8 text-white">
      <div className="absolute right-0 top-0 -mt-10 -mr-10 h-40 w-40 rounded-full bg-white/10"></div>
      <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-40 w-40 rounded-full bg-white/10"></div>
      <h2 className="relative text-lg sm:text-2xl font-bold break-words">{title}</h2>
      <p className="relative mt-2 text-xs sm:text-sm text-blue-100 break-words">{subtitle}</p>
      {badges.length > 0 && (
        <div className="relative mt-3 sm:mt-4 flex flex-wrap gap-3 sm:gap-4">
          {badges.map((badge, idx) => {
            const Icon = badge.icon;
            return (
              <div key={idx} className="flex items-center gap-1 sm:gap-2">
                <Icon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <span className="text-xs sm:text-sm">{badge.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};