// resources/js/components/residentui/modern-stats-cards.tsx

import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCard {
  title: string;
  value: string | number;
  icon?: React.ElementType;
  iconColor?: string;
  iconBgColor?: string;
  trend?: {
    value: string | number;
    positive: boolean;
  };
  footer?: string;
  onClick?: () => void;
}

interface ModernStatsCardsProps {
  cards: StatCard[];
  loading?: boolean;
  gridCols?: string;
  variant?: 'default' | 'compact' | 'mobile';
}

export const ModernStatsCards = ({
  cards,
  loading = false,
  gridCols = 'grid-cols-2 lg:grid-cols-4',
  variant = 'default',
}: ModernStatsCardsProps) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 sm:py-12">
        <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin text-gray-400" />
      </div>
    );
  }

  // Responsive styles based on variant
  const getVariantStyles = () => {
    switch (variant) {
      case 'compact':
        return {
          container: 'p-3 sm:p-4',
          iconPadding: 'p-2 sm:p-2.5',
          iconSize: 'h-5 w-5 sm:h-6 sm:w-6',
          titleSize: 'text-xs sm:text-sm font-medium',
          valueSize: 'text-lg sm:text-xl font-bold',
          trendSize: 'text-[10px] sm:text-xs',
          iconRounded: 'rounded-lg sm:rounded-xl',
        };
      case 'mobile':
        return {
          container: 'p-3',
          iconPadding: 'p-2',
          iconSize: 'h-5 w-5',
          titleSize: 'text-xs font-medium',
          valueSize: 'text-lg font-bold',
          trendSize: 'text-[10px]',
          iconRounded: 'rounded-lg',
        };
      default:
        return {
          container: 'p-4 sm:p-5 md:p-6',
          iconPadding: 'p-2.5 sm:p-3',
          iconSize: 'h-6 w-6 sm:h-7 sm:w-7',
          titleSize: 'text-sm sm:text-base font-semibold',
          valueSize: 'text-xl sm:text-2xl md:text-3xl font-bold',
          trendSize: 'text-xs sm:text-sm',
          iconRounded: 'rounded-xl',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className={cn('grid gap-2 sm:gap-3 md:gap-4', gridCols)}>
      {cards.map((card, index) => {
        const Icon = card.icon;
        const TrendIcon = card.trend?.positive ? TrendingUp : TrendingDown;
        
        const CardWrapper = card.onClick ? 'button' : 'div';
        
        return (
          <CardWrapper
            key={index}
            onClick={card.onClick}
            className={cn(
              'w-full text-left bg-white dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700/50',
              styles.container,
              'transition-all duration-200',
              card.onClick && 'cursor-pointer hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600 hover:scale-[1.02] active:scale-[0.98] touch-manipulation'
            )}
          >
            {/* MOBILE LAYOUT: Title ABOVE Value */}
            <div className="sm:hidden">
              {/* Title */}
              <div className={cn('mb-1', styles.titleSize, 'text-gray-600 dark:text-gray-400')}>
                {card.title}
              </div>
              
              {/* Value with Icon */}
              <div className="flex items-center gap-2">
                {Icon && (
                  <div
                    className={cn(
                      'flex-shrink-0',
                      styles.iconPadding,
                      styles.iconRounded,
                      card.iconBgColor || 'bg-gray-100 dark:bg-gray-800'
                    )}
                  >
                    <Icon
                      className={cn(
                        styles.iconSize,
                        card.iconColor || 'text-gray-600 dark:text-gray-400'
                      )}
                    />
                  </div>
                )}
                <span className={cn(
                  'text-gray-900 dark:text-white tabular-nums',
                  styles.valueSize
                )}>
                  {card.value}
                </span>
              </div>
              
              {/* Trend and Footer */}
              {(card.trend || card.footer) && (
                <div className={cn(
                  'flex items-center gap-1.5 text-gray-500 dark:text-gray-400 mt-1',
                  styles.trendSize
                )}>
                  {card.trend && (
                    <div className="flex items-center gap-0.5">
                      <TrendIcon 
                        className={cn(
                          'h-3 w-3 flex-shrink-0',
                          card.trend.positive
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        )}
                      />
                      <span
                        className={cn(
                          'font-semibold whitespace-nowrap',
                          card.trend.positive
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        )}
                      >
                        {card.trend.value}
                      </span>
                    </div>
                  )}
                  {card.footer && (
                    <>
                      {card.trend && (
                        <span className="text-gray-300 dark:text-gray-600">•</span>
                      )}
                      <span className="font-medium">{card.footer}</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* DESKTOP LAYOUT: Title and Value SIDE BY SIDE */}
            <div className="hidden sm:flex sm:items-center gap-3">
              {/* Icon */}
              {Icon && (
                <div
                  className={cn(
                    'flex-shrink-0',
                    styles.iconPadding,
                    styles.iconRounded,
                    card.iconBgColor || 'bg-gray-100 dark:bg-gray-800'
                  )}
                >
                  <Icon
                    className={cn(
                      styles.iconSize,
                      card.iconColor || 'text-gray-600 dark:text-gray-400'
                    )}
                  />
                </div>
              )}
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Title and Value Row - SIDE BY SIDE */}
                <div className="flex items-center justify-between gap-2">
                  <span className={cn(
                    'text-gray-600 dark:text-gray-400',
                    styles.titleSize
                  )}>
                    {card.title}
                  </span>
                  <span className={cn(
                    'text-gray-900 dark:text-white tabular-nums flex-shrink-0',
                    styles.valueSize
                  )}>
                    {card.value}
                  </span>
                </div>
                
                {/* Trend and Footer Row */}
                {(card.trend || card.footer) && (
                  <div className={cn(
                    'flex items-center gap-1.5 text-gray-500 dark:text-gray-400 mt-1',
                    styles.trendSize
                  )}>
                    {card.trend && (
                      <div className="flex items-center gap-0.5">
                        <TrendIcon 
                          className={cn(
                            'h-3 w-3 flex-shrink-0',
                            card.trend.positive
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-600 dark:text-red-400'
                          )}
                        />
                        <span
                          className={cn(
                            'font-semibold whitespace-nowrap',
                            card.trend.positive
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-600 dark:text-red-400'
                          )}
                        >
                          {card.trend.value}
                        </span>
                      </div>
                    )}
                    {card.footer && (
                      <>
                        {card.trend && (
                          <span className="text-gray-300 dark:text-gray-600">•</span>
                        )}
                        <span className="font-medium">{card.footer}</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardWrapper>
        );
      })}
    </div>
  );
};

// Mobile-only stacked version
export const MobileStatsCards = ({
  cards,
  loading = false,
}: Pick<ModernStatsCardsProps, 'cards' | 'loading'>) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const TrendIcon = card.trend?.positive ? TrendingUp : TrendingDown;
        
        return (
          <div
            key={index}
            className={cn(
              'bg-white dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700/50 p-3',
              card.onClick && 'cursor-pointer active:scale-[0.98] transition-transform touch-manipulation'
            )}
            onClick={card.onClick}
            role={card.onClick ? 'button' : undefined}
            tabIndex={card.onClick ? 0 : undefined}
          >
            {/* Title */}
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              {card.title}
            </div>
            
            {/* Value with Icon */}
            <div className="flex items-center gap-2">
              {Icon && (
                <div
                  className={cn(
                    'p-1.5 rounded-lg flex-shrink-0',
                    card.iconBgColor || 'bg-gray-100 dark:bg-gray-800'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-4 w-4',
                      card.iconColor || 'text-gray-600 dark:text-gray-400'
                    )}
                  />
                </div>
              )}
              <span className="text-lg font-bold text-gray-900 dark:text-white tabular-nums">
                {card.value}
              </span>
            </div>
            
            {/* Trend and footer */}
            {(card.trend || card.footer) && (
              <div className="flex items-center gap-1.5 mt-2 pt-1.5 border-t border-gray-100 dark:border-gray-800">
                {card.trend && (
                  <div className="flex items-center gap-0.5">
                    <TrendIcon 
                      className={cn(
                        'h-3 w-3 flex-shrink-0',
                        card.trend.positive
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      )}
                    />
                    <span
                      className={cn(
                        'text-xs font-semibold whitespace-nowrap',
                        card.trend.positive
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      )}
                    >
                      {card.trend.value}
                    </span>
                  </div>
                )}
                {card.footer && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {card.footer}
                  </span>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ModernStatsCards;