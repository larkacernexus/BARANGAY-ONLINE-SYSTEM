// components/community-report/SearchableResidentDropdown.tsx
import { useState, useEffect, useRef, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { Resident } from '@/types/admin/reports/community-report';

interface SearchableResidentDropdownProps {
    residents: Resident[];
    onSelect: (resident: Resident) => void;
    selectedResident: Resident | null;
    onClear: () => void;
    placeholder?: string;
}

export const SearchableResidentDropdown = ({ 
    residents, 
    onSelect,
    selectedResident,
    onClear,
    placeholder = "Search for resident..."
}: SearchableResidentDropdownProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const filteredResidents = useMemo(() => {
        if (!searchTerm) return residents;
        const searchLower = searchTerm.toLowerCase();
        return residents.filter(resident =>
            resident.name.toLowerCase().includes(searchLower) ||
            resident.email?.toLowerCase().includes(searchLower) ||
            resident.phone?.toLowerCase().includes(searchLower)
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
                    className="pl-10 pr-10 h-11 rounded-lg bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600 cursor-pointer"
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
            
            {showDropdown && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-80 overflow-y-auto">
                    {filteredResidents.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                            No residents found
                        </div>
                    ) : (
                        filteredResidents.map((resident) => (
                            <div
                                key={resident.id}
                                className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0"
                                onClick={() => handleSelect(resident)}
                            >
                                <div className="flex flex-col">
                                    <div className="font-medium text-gray-900 dark:text-gray-100">
                                        {resident.name}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                        {resident.email && <span>{resident.email}</span>}
                                        {resident.phone && <span className="ml-2">📞 {resident.phone}</span>}
                                    </div>
                                    {resident.address && (
                                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                            📍 {resident.address}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};