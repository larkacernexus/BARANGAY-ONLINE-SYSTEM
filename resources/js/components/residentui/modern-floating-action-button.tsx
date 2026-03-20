import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface FloatingActionButtonProps {
    icon: ReactNode;
    label: string;
    onClick: () => void;
    color?: 'red' | 'blue' | 'green' | 'purple';
}

export function ModernFloatingActionButton({ 
    icon, 
    label, 
    onClick, 
    color = 'blue',
}: FloatingActionButtonProps) {
    const colorConfig = {
        red: { bg: 'from-red-500 to-red-600', shadow: 'rgba(239, 68, 68, 0.5)' },
        blue: { bg: 'from-blue-500 to-blue-600', shadow: 'rgba(59, 130, 246, 0.5)' },
        green: { bg: 'from-green-500 to-green-600', shadow: 'rgba(34, 197, 94, 0.5)' },
        purple: { bg: 'from-purple-500 to-purple-600', shadow: 'rgba(168, 85, 247, 0.5)' },
    };

    return (
        <div className="fixed right-4 z-[47] flex flex-col items-end gap-2" style={{ bottom: 'calc(100px + env(safe-area-inset-bottom, 16px))' }}>
            <button
                onClick={onClick}
                className={cn(
                    "relative h-14 w-14 rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform hover:shadow-xl",
                    `bg-gradient-to-r ${colorConfig[color].bg}`
                )}
                style={{ boxShadow: `0 10px 25px -5px ${colorConfig[color].shadow}` }}
            >
                {icon}
                <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-ripple" />
            </button>
            <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg text-xs font-medium border border-gray-200 dark:border-gray-700">
                {label}
            </div>
        </div>
    );
}