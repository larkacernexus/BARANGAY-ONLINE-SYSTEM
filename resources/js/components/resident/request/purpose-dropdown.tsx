import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, Search, PenSquare, AlertCircle, X, Check } from 'lucide-react';

interface PurposeOption {
    value: string;
    label: string;
    icon: any;
}

interface PurposeDropdownProps {
    value: string;
    purposeCustom: string;
    isCustomPurpose: boolean;
    availablePurposes: PurposeOption[];
    purposeSearch: string;
    showPurposeDropdown: boolean;
    disabled?: boolean;
    placeholder?: string;
    onSelect: (value: string, label: string) => void;
    onCustomChange: (value: string) => void;
    onSearchChange: (value: string) => void;
    onToggleDropdown: (show: boolean) => void;
}

export function PurposeDropdown({
    value,
    purposeCustom,
    isCustomPurpose,
    availablePurposes,
    purposeSearch,
    showPurposeDropdown,
    disabled = false,
    placeholder = "Select purpose",
    onSelect,
    onCustomChange,
    onSearchChange,
    onToggleDropdown,
}: PurposeDropdownProps) {
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [filteredPurposes, setFilteredPurposes] = useState<PurposeOption[]>(availablePurposes);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                onToggleDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onToggleDropdown]);

    useEffect(() => {
        const filtered = purposeSearch
            ? availablePurposes.filter(purpose =>
                purpose.label.toLowerCase().includes(purposeSearch.toLowerCase())
            )
            : availablePurposes;
        setFilteredPurposes(filtered);
    }, [purposeSearch, availablePurposes]);

    const getDisplayPurpose = () => {
        if (isCustomPurpose) {
            return purposeCustom || 'Enter custom purpose...';
        }
        const selectedPurpose = availablePurposes.find(p => p.value === value);
        return selectedPurpose ? selectedPurpose.label : placeholder;
    };

    const getPurposeIcon = () => {
        if (isCustomPurpose) {
            return <PenSquare className="h-4 w-4 mr-2 text-blue-600" />;
        }
        const purpose = availablePurposes.find(p => p.value === value);
        if (purpose?.icon) {
            const IconComponent = purpose.icon;
            return <IconComponent className="h-4 w-4 mr-2 text-blue-600" />;
        }
        return <AlertCircle className="h-4 w-4 mr-2 text-blue-600" />;
    };

    const clearSelection = () => {
        onSelect('', '');
        onToggleDropdown(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <div className="flex items-center gap-2">
                <Button
                    type="button"
                    variant="outline"
                    className={`flex-1 justify-between h-12 text-sm border-2 ${isCustomPurpose ? 'border-blue-500' : ''}`}
                    onClick={() => onToggleDropdown(!showPurposeDropdown)}
                    disabled={disabled}
                >
                    <div className="flex items-center truncate">
                        {getPurposeIcon()}
                        <span className="truncate text-sm">{getDisplayPurpose()}</span>
                    </div>
                    <ChevronDown className={`h-4 w-4 transition-transform ${showPurposeDropdown ? 'rotate-180' : ''}`} />
                </Button>
                
                {value && !isCustomPurpose && !disabled && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-12 w-12"
                        onClick={clearSelection}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>

            {showPurposeDropdown && !disabled && (
                <div className="absolute z-50 mt-2 w-full rounded-lg border bg-white dark:bg-gray-900 shadow-xl max-h-[60vh]">
                    <div className="p-3 border-b bg-gray-50 dark:bg-gray-800 sticky top-0">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Search purposes..."
                                value={purposeSearch}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="pl-9 text-sm h-9 border-0 focus:ring-0"
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="max-h-[50vh] overflow-y-auto">
                        {filteredPurposes.length > 0 ? (
                            <div className="py-1">
                                {filteredPurposes.map((purpose) => {
                                    const IconComponent = purpose.icon;
                                    const isSelected = value === purpose.value && !isCustomPurpose;
                                    
                                    return (
                                        <button
                                            key={purpose.value}
                                            type="button"
                                            className={`w-full flex items-center justify-between px-3 py-3 text-sm transition-colors text-left hover:bg-gray-100 dark:hover:bg-gray-800 ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                                            onClick={() => onSelect(purpose.value, purpose.label)}
                                        >
                                            <div className="flex items-center gap-3 flex-1">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                                    <IconComponent className={`h-4 w-4 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
                                                </div>
                                                <div className="text-left">
                                                    <p className="font-medium">{purpose.label}</p>
                                                    {purpose.value === 'custom' && (
                                                        <p className="text-xs text-gray-500 mt-0.5">Specify your own purpose</p>
                                                    )}
                                                </div>
                                            </div>
                                            {isSelected && (
                                                <Check className="h-4 w-4 text-blue-600 flex-shrink-0" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="px-4 py-6 text-center">
                                <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-500">No purposes found</p>
                                <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
                            </div>
                        )}
                    </div>
                    
                    <div className="p-3 border-t bg-gray-50 dark:bg-gray-800">
                        <p className="text-xs text-gray-500">
                            {filteredPurposes.length} purpose{filteredPurposes.length !== 1 ? 's' : ''} found
                        </p>
                    </div>
                </div>
            )}

            {isCustomPurpose && (
                <div className="mt-3">
                    <div className="flex items-center gap-2 mb-2">
                        <Badge variant="default" className="gap-1">
                            <PenSquare className="h-3 w-3" />
                            Custom Purpose
                        </Badge>
                        <button
                            type="button"
                            onClick={() => {
                                onSelect('', '');
                                onToggleDropdown(true);
                            }}
                            className="text-xs text-blue-600 hover:underline"
                        >
                            Choose from list
                        </button>
                    </div>
                    <Input
                        value={purposeCustom}
                        onChange={(e) => onCustomChange(e.target.value)}
                        placeholder="Describe your specific purpose in detail..."
                        className="h-12 text-sm"
                        autoFocus
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Be specific about where and why you need this clearance
                    </p>
                </div>
            )}
        </div>
    );
}