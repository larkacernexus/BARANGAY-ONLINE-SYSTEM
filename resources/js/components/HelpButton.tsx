// Components/HelpButton.tsx
import React from 'react';
import { HelpCircle } from 'lucide-react';

interface HelpButtonProps {
    variant?: 'icon' | 'text' | 'both' | 'floating';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    onClick?: () => void;
}

const HelpButton: React.FC<HelpButtonProps> = ({
    variant = 'icon',
    size = 'md',
    className = '',
    onClick
}) => {
    if (variant === 'floating') {
        return (
            <button
                onClick={onClick}
                className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700"
                aria-label="Help"
                title="Help (F1)"
            >
                <HelpCircle className="h-6 w-6" />
            </button>
        );
    }

    return (
        <button
            onClick={onClick}
            className={`inline-flex items-center gap-2 rounded-lg bg-blue-100 px-4 py-2 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 ${className}`}
            title="Open help guide (F1)"
        >
            <HelpCircle className="h-4 w-4" />
            {variant === 'text' || variant === 'both' ? 'Help' : null}
        </button>
    );
};

export default HelpButton;