import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCard {
    title: string;
    value: string | number;
    icon: React.ElementType;
    color: string;
    bgColor: string;
    textColor: string;
    trend?: string;
    trendUp?: boolean;
    badge?: string | null;
}

interface ModernStatsCardsProps {
    cards: StatCard[];
    loading?: boolean;
    gridCols?: string;
}

export const ModernStatsCards = ({ cards, loading, gridCols = "grid-cols-2 lg:grid-cols-4" }: ModernStatsCardsProps) => {
    if (loading) {
        return (
            <div className={`grid ${gridCols} gap-3`}>
                {[...Array(cards.length)].map((_, i) => (
                    <Skeleton key={i} className="h-32 rounded-xl" />
                ))}
            </div>
        );
    }

    return (
        <div className={`grid ${gridCols} gap-3`}>
            {cards.map((card, index) => (
                <div
                    key={card.title}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                >
                    <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50 overflow-hidden relative group hover:shadow-xl transition-all duration-300">
                        <CardContent className="p-4">
                            {/* Background Decoration */}
                            <div className={`absolute top-0 right-0 w-24 h-24 ${card.bgColor} rounded-full -translate-y-8 translate-x-8 opacity-50 group-hover:scale-150 transition-transform duration-500`} />
                            
                            <div className="relative">
                                <div className="flex items-start justify-between mb-2">
                                    <div className={`p-2 rounded-lg bg-gradient-to-br ${card.color} shadow-lg`}>
                                        <card.icon className="h-4 w-4 text-white" />
                                    </div>
                                    {card.badge && (
                                        <Badge variant="destructive" className="text-xs">
                                            {card.badge}
                                        </Badge>
                                    )}
                                </div>
                                
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                    {card.title}
                                </p>
                                
                                <p className="text-xl font-bold text-gray-900 dark:text-white">
                                    {card.value}
                                </p>
                                
                                {card.trend && (
                                    <div className="flex items-center gap-1 mt-2">
                                        <TrendingUp className={cn(
                                            "h-3 w-3",
                                            card.trendUp ? "text-emerald-500" : "text-amber-500"
                                        )} />
                                        <span className={cn(
                                            "text-xs font-medium",
                                            card.trendUp ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                                        )}>
                                            {card.trend}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            ))}
        </div>
    );
};