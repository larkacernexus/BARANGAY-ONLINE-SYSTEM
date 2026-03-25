// /components/residentui/instructions/MainContent.tsx
import React from 'react';
import { Link } from '@inertiajs/react';
import { Printer, Share2, ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Section {
  id: string;
  title: string;
  icon: React.ElementType;
  description: string;
  content: React.ReactNode;
}

interface MainContentProps {
  selectedContent: Section;
  sections: Section[];
  onPrevious: () => void;
  onNext: () => void;
  isMobile: boolean;
  isMobileMenuOpen: boolean;
}

export const MainContent: React.FC<MainContentProps> = ({
  selectedContent,
  sections,
  onPrevious,
  onNext,
  isMobile,
  isMobileMenuOpen,
}) => {
  const getIcon = (IconComponent: React.ElementType) => {
    return <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />;
  };

  const currentIndex = sections.findIndex(s => s.id === selectedContent.id);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < sections.length - 1;

  return (
    <div className={cn(
      "md:col-span-9 min-w-0",
      isMobile && isMobileMenuOpen && "hidden"
    )}>
      <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6 dark:border-gray-700 dark:bg-gray-900">
        {/* Breadcrumb */}
        <nav className="mb-3 sm:mb-4 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm flex-wrap">
          <Link href="/portal/dashboard" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 whitespace-nowrap">
            Dashboard
          </Link>
          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
          <span className="font-medium text-gray-900 dark:text-white truncate max-w-[100px] sm:max-w-none">
            {selectedContent.title}
          </span>
        </nav>

        {/* Section Header */}
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="rounded-lg bg-blue-100 p-2 sm:p-3 dark:bg-blue-900/30 flex-shrink-0">
              {getIcon(selectedContent.icon)}
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base md:text-2xl font-bold text-gray-900 dark:text-white break-words">
                {selectedContent.title}
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5 sm:mt-1 break-words">
                {selectedContent.description}
              </p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-1 sm:gap-2">
            <button className="rounded-lg border border-gray-300 p-1.5 sm:p-2 text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700">
              <Printer className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            </button>
            <button className="rounded-lg border border-gray-300 p-1.5 sm:p-2 text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700">
              <Share2 className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            </button>
          </div>
        </div>

        {/* Section Content */}
        <div className="prose prose-sm sm:prose-base max-w-none dark:prose-invert overflow-hidden">
          {selectedContent.content}
        </div>

        {/* Previous/Next Navigation */}
        <div className="mt-6 sm:mt-8 flex items-center justify-between border-t border-gray-200 pt-4 sm:pt-6 dark:border-gray-700">
          <button
            onClick={onPrevious}
            disabled={!hasPrevious}
            className={cn(
              "flex items-center gap-1 sm:gap-2 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm",
              hasPrevious
                ? "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                : "text-gray-300 cursor-not-allowed dark:text-gray-600"
            )}
          >
            <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="hidden sm:inline">Previous</span>
          </button>
          <button
            onClick={onNext}
            disabled={!hasNext}
            className={cn(
              "flex items-center gap-1 sm:gap-2 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm",
              hasNext
                ? "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                : "text-gray-300 cursor-not-allowed dark:text-gray-600"
            )}
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
};