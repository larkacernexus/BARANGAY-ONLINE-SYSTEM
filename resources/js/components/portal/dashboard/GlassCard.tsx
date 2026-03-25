// /components/residentui/dashboard/GlassCard.tsx
import React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    interactive?: boolean;
    gradient?: boolean;
    onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
    children, 
    className = '', 
    interactive = false, 
    gradient = false, 
    onClick 
}) => (
    <div 
        onClick={onClick}
        className={cn(
            "relative overflow-hidden",
            "bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl",
            "rounded-2xl border border-white/20 dark:border-gray-700/30",
            "shadow-lg shadow-black/5",
            interactive && "active:scale-[0.98] hover:shadow-xl hover:scale-[1.02] hover:bg-white dark:hover:bg-gray-900 transition-all duration-300",
            gradient && "bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50",
            className
        )}
    >
        {children}
    </div>
);