import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModernSelectProps {
    value: string;
    onValueChange: (value: string) => void;
    placeholder: string;
    options: Array<{ value: string; label: string }>;
    disabled?: boolean;
    icon?: React.ElementType;
    className?: string;
}

export const ModernSelect = ({
    value,
    onValueChange,
    placeholder,
    options,
    disabled,
    icon: Icon,
    className
}: ModernSelectProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                disabled={disabled}
                className={cn(
                    "flex items-center w-full h-10 px-3 py-2 text-sm",
                    "bg-white dark:bg-gray-900",
                    "border border-gray-200 dark:border-gray-700",
                    "rounded-xl shadow-sm",
                    "hover:border-gray-300 dark:hover:border-gray-600",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500",
                    "transition-all duration-200",
                    disabled && "opacity-50 cursor-not-allowed",
                    className
                )}
            >
                {Icon && <Icon className="h-4 w-4 mr-2 text-gray-500" />}
                <span className="flex-1 text-left truncate">
                    {options.find(opt => opt.value === value)?.label || placeholder}
                </span>
                <ChevronDown className={cn(
                    "h-4 w-4 text-gray-500 transition-transform duration-200",
                    isOpen && "transform rotate-180"
                )} />
            </button>

            {isOpen && (
                <>
                    <div 
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden">
                        <div className="max-h-60 overflow-y-auto p-1">
                            <button
                                onClick={() => {
                                    onValueChange('');
                                    setIsOpen(false);
                                }}
                                className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                {placeholder}
                            </button>
                            {options.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => {
                                        onValueChange(option.value);
                                        setIsOpen(false);
                                    }}
                                    className={cn(
                                        "w-full text-left px-3 py-2 text-sm rounded-lg transition-colors",
                                        value === option.value
                                            ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                                            : "hover:bg-gray-100 dark:hover:bg-gray-700"
                                    )}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};