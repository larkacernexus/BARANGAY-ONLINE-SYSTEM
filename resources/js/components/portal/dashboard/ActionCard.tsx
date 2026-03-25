// /components/residentui/dashboard/ActionCard.tsx
import React from 'react';
import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlassCard } from './GlassCard';
import { useMobile } from '@/components/residentui/hooks/use-mobile';

interface ActionCardProps {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    description: string;
    href: string;
    badge?: number;
    gradient?: string;
}

export const ActionCard: React.FC<ActionCardProps> = ({ 
    icon: Icon, 
    label, 
    description, 
    href, 
    badge = 0, 
    gradient = 'from-blue-500 to-blue-600' 
}) => {
    const isMobile = useMobile();
    
    return (
        <Link href={href} className="group relative block">
            <GlassCard interactive className="p-4 sm:p-5">
                <div className="flex items-start gap-3 sm:gap-4">
                    <div className={cn(`p-2 sm:p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg shadow-${gradient.split(' ')[0].replace('from-', '')}/25 transition-transform group-hover:scale-110 duration-300 flex-shrink-0`)}>
                        <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white truncate">{label}</h3>
                        {!isMobile && (
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate">{description}</p>
                        )}
                    </div>
                    {badge > 0 && (
                        <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20 flex-shrink-0">
                            {badge}
                        </span>
                    )}
                </div>
                {!isMobile && (
                    <ArrowRight className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0" />
                )}
            </GlassCard>
        </Link>
    );
};