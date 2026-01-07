import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronDown, Search, PenSquare, AlertCircle } from 'lucide-react';

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
        const filtered = purposeSearch
            ? availablePurposes.filter(purpose =>
                purpose.label.toLowerCase().includes(purposeSearch.toLowerCase()) ||
                purpose.value.toLowerCase().includes(purposeSearch.toLowerCase())
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
            return <PenSquare className="h-4 w-4 mr-2" />;
        }
        const purpose = availablePurposes.find(p => p.value === value);
        if (purpose?.icon) {
            const IconComponent = purpose.icon;
            return <IconComponent className="h-4 w-4 mr-2" />;
        }
        return <AlertCircle className="h-4 w-4 mr-2" />;
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <Button
                type="button"
                variant="outline"
                className="w-full justify-between h-12 text-sm"
                onClick={() => onToggleDropdown(!showPurposeDropdown)}
                disabled={disabled}
            >
                <div className="flex items-center truncate">
                    {getPurposeIcon()}
                    <span className="truncate text-sm">{getDisplayPurpose()}</span>
                </div>
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>

            {showPurposeDropdown && !disabled && (
                <div className="absolute z-50 mt-1 w-full rounded-md border bg-white dark:bg-gray-900 shadow-lg max-h-[50vh]">
                    <div className="p-2 border-b sticky top-0 bg-white dark:bg-gray-900">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Search purposes..."
                                value={purposeSearch}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="pl-9 text-sm h-9"
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="max-h-[40vh] overflow-y-auto">
                        {filteredPurposes.length > 0 ? (
                            filteredPurposes.map((purpose) => {
                                const IconComponent = purpose.icon;
                                return (
                                    <button
                                        key={purpose.value}
                                        type="button"
                                        className="w-full flex items-center gap-2 px-3 lg:px-4 py-2 lg:py-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
                                        onClick={() => onSelect(purpose.value, purpose.label)}
                                    >
                                        <IconComponent className="h-4 w-4 flex-shrink-0" />
                                        <span className="text-sm">{purpose.label}</span>
                                    </button>
                                );
                            })
                        ) : (
                            <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                No purposes found
                            </div>
                        )}
                    </div>
                </div>
            )}

            {isCustomPurpose && (
                <div className="mt-2 lg:mt-3">
                    <Input
                        value={purposeCustom}
                        onChange={(e) => onCustomChange(e.target.value)}
                        placeholder="Enter your custom purpose..."
                        className="h-12 text-sm"
                        autoFocus
                    />
                </div>
            )}
        </div>
    );
}