import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';

// Reusable Stats Card Component
interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'gray';
  variant?: 'default' | 'gradient';
}

export const StatsCard = ({
  title,
  value,
  description,
  icon: Icon,
  color,
  variant = 'gradient'
}: StatsCardProps) => {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-100 dark:bg-blue-800/30',
      icon: 'text-blue-600 dark:text-blue-400',
      gradientFrom: 'from-blue-50',
      gradientTo: 'to-blue-100',
      darkFrom: 'dark:from-blue-900/20',
      darkTo: 'dark:to-blue-900/10'
    },
    green: {
      bg: 'bg-green-100 dark:bg-green-800/30',
      icon: 'text-green-600 dark:text-green-400',
      gradientFrom: 'from-green-50',
      gradientTo: 'to-green-100',
      darkFrom: 'dark:from-green-900/20',
      darkTo: 'dark:to-green-900/10'
    },
    amber: {
      bg: 'bg-amber-100 dark:bg-amber-800/30',
      icon: 'text-amber-600 dark:text-amber-400',
      gradientFrom: 'from-amber-50',
      gradientTo: 'to-amber-100',
      darkFrom: 'dark:from-amber-900/20',
      darkTo: 'dark:to-amber-900/10'
    },
    red: {
      bg: 'bg-red-100 dark:bg-red-800/30',
      icon: 'text-red-600 dark:text-red-400',
      gradientFrom: 'from-red-50',
      gradientTo: 'to-red-100',
      darkFrom: 'dark:from-red-900/20',
      darkTo: 'dark:to-red-900/10'
    },
    purple: {
      bg: 'bg-purple-100 dark:bg-purple-800/30',
      icon: 'text-purple-600 dark:text-purple-400',
      gradientFrom: 'from-purple-50',
      gradientTo: 'to-purple-100',
      darkFrom: 'dark:from-purple-900/20',
      darkTo: 'dark:to-purple-900/10'
    },
    gray: {
      bg: 'bg-gray-100 dark:bg-gray-800/30',
      icon: 'text-gray-600 dark:text-gray-400',
      gradientFrom: 'from-gray-50',
      gradientTo: 'to-gray-100',
      darkFrom: 'dark:from-gray-900/20',
      darkTo: 'dark:to-gray-900/10'
    }
  };

  const { bg, icon: iconColor, gradientFrom, gradientTo, darkFrom, darkTo } = colorClasses[color];

  return (
    <Card className={variant === 'gradient' 
      ? `bg-gradient-to-br ${gradientFrom} ${gradientTo} ${darkFrom} ${darkTo} border-0` 
      : 'border border-gray-200 dark:border-gray-700'
    }>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm font-medium ${variant === 'gradient' ? `text-${color}-600 dark:text-${color}-400` : 'text-gray-600 dark:text-gray-400'}`}>
              {title}
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
              {value}
            </p>
            {description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {description}
              </p>
            )}
          </div>
          <div className={`p-2 ${bg} rounded-lg`}>
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Reusable Filter Card Component
interface FilterCardProps {
  children: ReactNode;
  className?: string;
}

export const FilterCard = ({ children, className = '' }: FilterCardProps) => (
  <Card className={`border border-gray-200 dark:border-gray-700 ${className}`}>
    <CardContent className="p-4">
      {children}
    </CardContent>
  </Card>
);

// Reusable Tab Component
interface Tab {
  id: string;
  label: string;
  icon: LucideIcon;
  count?: number | string;
}

interface CustomTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export const CustomTabs = ({ tabs, activeTab, onTabChange, className = '' }: CustomTabsProps) => (
  <div className={`overflow-x-auto scrollbar-hide ${className}`}>
    <div className="flex min-w-max space-x-1 pb-2">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap
              ${isActive 
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }
              min-w-[70px]
            `}
          >
            <Icon className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`
                px-1.5 py-0.5 rounded-full text-[10px] font-medium min-w-[20px] text-center
                ${isActive 
                  ? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }
              `}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  </div>
);

// Reusable Empty State Component
interface EmptyStateProps {
  title: string;
  description: string;
  icon: LucideIcon;
  action?: ReactNode;
}

export const EmptyState = ({ title, description, icon: Icon, action }: EmptyStateProps) => (
  <div className="text-center py-12">
    <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
      <Icon className="h-8 w-8 text-gray-400" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
      {title}
    </h3>
    <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-md mx-auto">
      {description}
    </p>
    {action}
  </div>
);

// Reusable Page Header Component
interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  breadcrumbs?: { title: string; href: string }[];
  children?: ReactNode;
}

export const PageHeader = ({ title, description, actions, children }: PageHeaderProps) => (
  <div className="space-y-4">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex-1">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
    {children}
  </div>
);

// Reusable Loading Overlay Component
interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
}

export const LoadingOverlay = ({ isLoading, message = 'Loading...' }: LoadingOverlayProps) => {
  if (!isLoading) return null;
  
  return (
    <div className="fixed inset-0 bg-black/10 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-sm text-gray-600 dark:text-gray-300">{message}</p>
      </div>
    </div>
  );
};

// Reusable Selection Mode Banner Component
interface SelectionBannerProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onCancel: () => void;
  onDelete?: () => void;
  deleteLabel?: string;
}

export const SelectionBanner = ({
  selectedCount,
  totalCount,
  onSelectAll,
  onCancel,
  onDelete,
  deleteLabel = 'Delete Selected'
}: SelectionBannerProps) => (
  <div className="mb-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <Badge variant="secondary" className="gap-1">
          <span className="h-3 w-3">☑️</span>
          Selection Mode
        </Badge>
        <span className="text-sm text-blue-700 dark:text-blue-300">
          {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
        </span>
      </div>
      <div className="flex gap-2 w-full sm:w-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={onSelectAll}
          className="flex-1 sm:flex-none"
        >
          {selectedCount === totalCount && totalCount > 0
            ? 'Deselect All'
            : 'Select All'}
        </Button>
        {onDelete && selectedCount > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={onDelete}
            className="flex-1 sm:flex-none"
          >
            {deleteLabel}
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="flex-1 sm:flex-none"
        >
          Cancel
        </Button>
      </div>
    </div>
  </div>
);