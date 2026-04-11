// /components/portal/clearance/index/FilterModalContent.tsx
import { ModernSelect } from '@/components/residentui/modern-select';
import { FileText, Flag, AlertCircle, Layers, Calendar, User } from 'lucide-react';

interface FilterModalContentProps {
    clearanceTypeFilter: string;
    onClearanceTypeChange: (value: string) => void;
    residentFilter: string;
    onResidentChange: (value: string) => void;
    urgencyFilter: string;
    onUrgencyChange: (value: string) => void;
    yearFilter: string;
    onYearChange: (value: string) => void;
    loading: boolean;
    availableClearanceTypes: Array<{ id: number; name: string }>;
    householdResidents: Array<{ id: number; first_name: string; last_name: string }>;
    availableYears: number[];
    currentResidentId?: number;
}

export const FilterModalContent = ({
    clearanceTypeFilter,
    onClearanceTypeChange,
    residentFilter,
    onResidentChange,
    urgencyFilter,
    onUrgencyChange,
    yearFilter,
    onYearChange,
    loading,
    availableClearanceTypes,
    householdResidents,
    availableYears,
    currentResidentId,
}: FilterModalContentProps) => {
    // Clearance Type options
    const clearanceTypeOptions = [
        { value: 'all', label: 'All Clearance Types' },
        ...availableClearanceTypes.map(type => ({
            value: type.name.toLowerCase().replace(/\s+/g, '_'),
            label: type.name
        }))
    ];

    // Resident options
    const residentOptions = [
        { value: 'all', label: 'All Residents' },
        ...householdResidents.map(resident => ({
            value: resident.id.toString(),
            label: `${resident.first_name} ${resident.last_name}`
        }))
    ];

    // Urgency options
    const urgencyOptions = [
        { value: 'all', label: 'All Urgency Levels' },
        { value: 'normal', label: 'Normal' },
        { value: 'rush', label: 'Rush' },
        { value: 'express', label: 'Express' },
    ];

    // Year options
    const yearOptions = [
        { value: 'all', label: 'All Years' },
        ...availableYears.map(year => ({
            value: year.toString(),
            label: year.toString()
        }))
    ];

    return (
        <div className="space-y-4">
            {/* Clearance Type Filter */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Clearance Type
                </label>
                <ModernSelect
                    value={clearanceTypeFilter}
                    onValueChange={onClearanceTypeChange}
                    placeholder="Select clearance type"
                    options={clearanceTypeOptions}
                    disabled={loading}
                />
            </div>

            {/* Resident Filter */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Resident
                </label>
                <ModernSelect
                    value={residentFilter}
                    onValueChange={onResidentChange}
                    placeholder="Select resident"
                    options={residentOptions}
                    disabled={loading}
                />
                {currentResidentId && (
                    <p className="text-xs text-gray-500 mt-1">
                        Current resident ID: {currentResidentId}
                    </p>
                )}
            </div>

            {/* Urgency Filter */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Flag className="h-4 w-4" />
                    Urgency Level
                </label>
                <ModernSelect
                    value={urgencyFilter}
                    onValueChange={onUrgencyChange}
                    placeholder="Select urgency"
                    options={urgencyOptions}
                    disabled={loading}
                />
            </div>

            {/* Year Filter */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Year
                </label>
                <ModernSelect
                    value={yearFilter}
                    onValueChange={onYearChange}
                    placeholder="Select year"
                    options={yearOptions}
                    disabled={loading}
                />
            </div>
        </div>
    );
};