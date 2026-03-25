// /components/residentui/announcements/SearchBar.tsx
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    onClear: () => void;
    loading: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
    value,
    onChange,
    onSubmit,
    onClear,
    loading
}) => {
    return (
        <div className="px-4 sm:px-0">
            <form onSubmit={onSubmit} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <Input
                    type="text"
                    placeholder="Search announcements..."
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="pl-10 pr-10 h-11 md:h-12 rounded-lg md:rounded-xl shadow-sm border-gray-200 dark:border-gray-700 focus:border-primary dark:focus:border-primary-400 text-sm md:text-base dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-400"
                    disabled={loading}
                />
                {value && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 md:h-8 md:w-8 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={onClear}
                    >
                        <X className="h-3.5 w-3.5 md:h-4 md:w-4 text-gray-500 dark:text-gray-400" />
                    </Button>
                )}
            </form>
        </div>
    );
};