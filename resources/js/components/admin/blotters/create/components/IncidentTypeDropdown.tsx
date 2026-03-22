// components/blotter/IncidentTypeDropdown.tsx
import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Search, X } from 'lucide-react';
import { IncidentType } from './BlotterTypes';
import { getPriorityLevelColor, getPriorityLevelLabel } from '@/data/blotterIncidentTypes';

interface IncidentTypeDropdownProps {
    selectedType: IncidentType | null;
    onSelect: (type: IncidentType) => void;
    onClear: () => void;
    filteredTypes: IncidentType[];
    groupedTypes: Record<string, IncidentType[]>;
    error?: string;
}

export const IncidentTypeDropdown = ({
    selectedType,
    onSelect,
    onClear,
    filteredTypes,
    groupedTypes,
    error
}: IncidentTypeDropdownProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (type: IncidentType) => {
        onSelect(type);
        setSearchTerm(type.name);
        setShowDropdown(false);
    };

    return (
        <div className="space-y-2">
            <Label htmlFor="incident_type" className="dark:text-gray-300">
                Incident Type <span className="text-red-500">*</span>
            </Label>
            <div className="relative" ref={dropdownRef}>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <Input
                        ref={inputRef}
                        type="text"
                        placeholder="Search incident type..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setShowDropdown(true);
                            if (!e.target.value && selectedType) {
                                onClear();
                            }
                        }}
                        onFocus={() => setShowDropdown(true)}
                        className="pl-10 pr-10 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 cursor-pointer"
                    />
                    {selectedType && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                            onClick={() => {
                                onClear();
                                setSearchTerm('');
                            }}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    )}
                </div>
                
                {showDropdown && (
                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-80 overflow-y-auto">
                        {filteredTypes.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                                No incident types found
                            </div>
                        ) : (
                            Object.entries(groupedTypes).map(([category, types]) => (
                                <div key={category}>
                                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-50 dark:bg-gray-800 dark:text-gray-400 sticky top-0">
                                        {category}
                                    </div>
                                    {types.map((type) => (
                                        <div
                                            key={type.code}
                                            className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0"
                                            onClick={() => handleSelect(type)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="font-medium text-gray-900 dark:text-gray-100">
                                                        {type.name}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                        {type.code} • {type.description.substring(0, 60)}...
                                                    </div>
                                                </div>
                                                <span className={`text-xs px-2 py-1 rounded-full ml-2 ${getPriorityLevelColor(type.priority_level)}`}>
                                                    {getPriorityLevelLabel(type.priority_level)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        </div>
    );
};