// components/blotter/SearchableResidentSelect.tsx
import { useState, useRef, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, X } from 'lucide-react';
import { Resident } from '@/types/admin/blotters/blotter';

interface SearchableResidentSelectProps {
    residents: Resident[];
    label: string;
    placeholder?: string;
    selectedResident: Resident | null;
    onSelect: (resident: Resident) => void;
    onClear: () => void;
    required?: boolean;
    error?: string;
    showContact?: boolean;
}

export const SearchableResidentSelect = ({
    residents,
    label,
    placeholder = "Search resident by name...",
    selectedResident,
    onSelect,
    onClear,
    required = false,
    error,
    showContact = false
}: SearchableResidentSelectProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const filteredResidents = useMemo(() => {
        if (!searchTerm) return residents;
        const searchLower = searchTerm.toLowerCase();
        return residents.filter(resident =>
            resident.name.toLowerCase().includes(searchLower) ||
            resident.contact_number?.toLowerCase().includes(searchLower)
        );
    }, [searchTerm, residents]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (resident: Resident) => {
        onSelect(resident);
        setSearchTerm(resident.name);
        setShowDropdown(false);
    };

    return (
        <div className="space-y-2">
            <Label className="dark:text-gray-300">
                {label} {required && <span className="text-red-500">*</span>}
            </Label>
            <div className="relative" ref={dropdownRef}>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <Input
                        ref={inputRef}
                        type="text"
                        placeholder={placeholder}
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setShowDropdown(true);
                            if (!e.target.value && selectedResident) {
                                onClear();
                            }
                        }}
                        onFocus={() => setShowDropdown(true)}
                        className="pl-10 pr-10 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                    />
                    {selectedResident && (
                        <button
                            type="button"
                            onClick={() => {
                                onClear();
                                setSearchTerm('');
                            }}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
                
                {showDropdown && filteredResidents.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {filteredResidents.map((resident) => (
                            <div
                                key={resident.id}
                                className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-800"
                                onClick={() => handleSelect(resident)}
                            >
                                <div className="font-medium text-gray-900 dark:text-gray-100">
                                    {resident.name}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {resident.address && `📍 ${resident.address}`}
                                    {showContact && resident.contact_number && ` • 📞 ${resident.contact_number}`}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        </div>
    );
};