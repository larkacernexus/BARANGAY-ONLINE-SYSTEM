// /components/residentui/instructions/SidebarNavigation.tsx
import React from 'react';
import { Link } from '@inertiajs/react';
import { Search, X, HelpCircle, Settings, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Section {
  id: string;
  title: string;
  icon: LucideIcon;
  description: string;
}

interface SidebarNavigationProps {
  sections: Section[];
  selectedSection: string;
  onSectionSelect: (id: string) => void;
  searchQuery: string;
  filteredSections: Section[];
  isMobile: boolean;
  isMobileMenuOpen: boolean;
  onMobileMenuClose: () => void;
}

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  sections,
  selectedSection,
  onSectionSelect,
  searchQuery,
  filteredSections,
  isMobile,
  isMobileMenuOpen,
  onMobileMenuClose,
}) => {
  const getIcon = (IconComponent: LucideIcon) => {
    return <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />;
  };

  const displaySections = searchQuery ? filteredSections : sections;

  return (
    <div className={cn(
      "md:col-span-3",
      isMobile && !isMobileMenuOpen && "hidden",
      isMobile && "fixed inset-0 z-50 bg-black/50",
    )}>
      <div className={cn(
        "md:sticky md:top-20 rounded-lg border border-gray-200 bg-white p-3 sm:p-4 dark:border-gray-700 dark:bg-gray-900",
        isMobile && "absolute top-0 left-0 h-full w-64 overflow-y-auto rounded-none"
      )}>
        {isMobile && (
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Sections
            </h3>
            <button
              onClick={onMobileMenuClose}
              className="rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="h-4 w-4 flex-shrink-0" />
            </button>
          </div>
        )}
        <h3 className="mb-3 text-xs sm:text-sm font-semibold text-gray-900 dark:text-white hidden md:block">
          Household Head Guide
        </h3>
        {searchQuery && displaySections.length === 0 ? (
          <div className="text-center py-4">
            <Search className="h-8 w-8 mx-auto text-gray-400 mb-2" />
            <p className="text-xs text-gray-500">No sections found</p>
          </div>
        ) : (
          <nav className="space-y-1">
            {displaySections.map((section) => {
              const isSelected = selectedSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => onSectionSelect(section.id)}
                  className={cn(
                    'flex w-full items-start gap-2 sm:gap-3 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-left text-xs sm:text-sm transition-colors',
                    isSelected
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  )}
                >
                  <div className={cn(
                    'mt-0.5 rounded p-1 flex-shrink-0',
                    isSelected
                      ? 'bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-400'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-400'
                  )}>
                    {getIcon(section.icon)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{section.title}</div>
                    {!isMobile && (
                      <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 line-clamp-2 break-words">
                        {section.description}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </nav>
        )}

        {/* Resources */}
        {!isMobile && (
          <div className="mt-6 rounded-lg bg-gray-50 p-3 sm:p-4 dark:bg-gray-700/50">
            <h4 className="mb-2 sm:mb-3 text-xs sm:text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Helpful Links
            </h4>
            <div className="space-y-1 sm:space-y-2">
              <Link href="/portal/support" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400">
                <HelpCircle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="truncate">Contact Support</span>
              </Link>
              <Link href="/residentsettings/profile" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400">
                <Settings className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="truncate">Profile Settings</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};