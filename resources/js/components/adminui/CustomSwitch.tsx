import React from 'react';

interface CustomSwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    className?: string;
}

export default function CustomSwitch({ 
    checked, 
    onChange, 
    disabled = false,
    className = '' 
}: CustomSwitchProps) {
    const handleClick = () => {
        if (!disabled) {
            onChange(!checked);
        }
    };

    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={handleClick}
            className={`
                relative inline-flex h-5 w-9 items-center rounded-full transition-colors
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50
                ${checked ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'}
                ${className}
            `}
        >
            <span
                className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                    ${checked ? 'translate-x-5' : 'translate-x-0.5'}
                `}
            />
        </button>
    );
}