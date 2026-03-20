// resources/js/components/residentui/modern-stats-cards.tsx

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface StatCard {
  title: string;
  value: string | number;
  icon: React.ElementType;
  iconColor?: string;
  iconBgColor?: string;
  trend?: {
    value: string | number;
    positive: boolean;
  };
  footer?: string;
}

interface ModernStatsCardsProps {
  cards: StatCard[];
  loading?: boolean;
  gridCols?: string;
}

export const ModernStatsCards = ({
  cards,
  loading = false,
  gridCols = 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-4',
}: ModernStatsCardsProps) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-4 sm:py-12">
        <Loader2 className="h-4 w-4 sm:h-8 sm:w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className={cn('grid gap-1 sm:gap-4', gridCols)}>
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className="bg-white dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-700/50 p-1.5 sm:p-6"
          >
            <div className="flex items-center gap-1.5 sm:gap-3">
              {/* Icon */}
              <div
                className={cn(
                  'p-1 sm:p-2.5 rounded sm:rounded-lg flex-shrink-0',
                  card.iconBgColor || 'bg-gray-100 dark:bg-gray-700'
                )}
              >
                <Icon
                  className={cn(
                    'h-2.5 w-2.5 sm:h-4 sm:w-4',
                    card.iconColor || 'text-gray-600 dark:text-gray-400'
                  )}
                />
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-1">
                  <span className="text-[8px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 truncate">
                    {card.title}
                  </span>
                  <span className="text-xs sm:text-base font-bold text-gray-900 dark:text-white">
                    {card.value}
                  </span>
                </div>
                
                {(card.trend || card.footer) && (
                  <div className="flex items-center gap-1 text-[6px] sm:text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    {card.trend && (
                      <span
                        className={cn(
                          'font-medium',
                          card.trend.positive
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        )}
                      >
                        {card.trend.positive ? '↑' : '↓'} {card.trend.value}
                      </span>
                    )}
                    {card.footer && (
                      <span className="truncate">{card.footer}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};