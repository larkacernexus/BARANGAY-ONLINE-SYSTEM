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
      <div className="flex items-center justify-center py-8 sm:py-12">
        <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className={cn('grid gap-3 sm:gap-4', gridCols)}>
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className="bg-white dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700/50 p-4 sm:p-6"
          >
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Icon - MUCH LARGER */}
              <div
                className={cn(
                  'p-2.5 sm:p-3 rounded-xl sm:rounded-xl flex-shrink-0',
                  card.iconBgColor || 'bg-gray-100 dark:bg-gray-700'
                )}
              >
                <Icon
                  className={cn(
                    'h-6 w-6 sm:h-7 sm:w-7',
                    card.iconColor || 'text-gray-600 dark:text-gray-400'
                  )}
                />
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  {/* TITLE - MUCH LARGER */}
                  <span className="text-sm sm:text-base font-semibold text-gray-600 dark:text-gray-400 truncate">
                    {card.title}
                  </span>
                  {/* VALUE - MUCH LARGER */}
                  <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    {card.value}
                  </span>
                </div>
                
                {(card.trend || card.footer) && (
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1.5">
                    {card.trend && (
                      <span
                        className={cn(
                          'font-semibold',
                          card.trend.positive
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        )}
                      >
                        {card.trend.positive ? '↑' : '↓'} {card.trend.value}
                      </span>
                    )}
                    {card.footer && (
                      <span className="truncate font-medium">{card.footer}</span>
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