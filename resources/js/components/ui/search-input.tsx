// components/ui/search-input.tsx
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    debounceMs?: number;
    className?: string;
    disabled?: boolean;
}

export function SearchInput({
    value,
    onChange,
    placeholder = 'Search...',
    debounceMs = 300,
    className = '',
    disabled = false
}: SearchInputProps) {
    const [inputValue, setInputValue] = useState(value);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (inputValue !== value) {
                onChange(inputValue);
            }
        }, debounceMs);

        return () => clearTimeout(timeout);
    }, [inputValue, onChange, debounceMs, value]);

    const handleClear = () => {
        setInputValue('');
        onChange('');
    };

    return (
        <div className={`relative ${className}`}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={placeholder}
                className="pl-10 pr-10"
                disabled={disabled}
            />
            {inputValue && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClear}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                >
                    <X className="h-4 w-4" />
                </Button>
            )}
        </div>
    );
}