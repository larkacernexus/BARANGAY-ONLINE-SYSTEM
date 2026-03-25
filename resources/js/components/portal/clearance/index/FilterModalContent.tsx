// /components/portal/clearance/index/FilterModalContent.tsx
import { ModernSelect } from '@/components/residentui/modern-select';
import { Flag, FileText, Calendar, Users, DollarSign } from 'lucide-react';

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
    householdResidents: Array<{ 
        id: number; 
        first_name: string; 
        last_name: string;
        full_name?: string;
    }>;
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
    currentResidentId
}: FilterModalContentProps) => {
    // Helper function to get resident display name
    const getResidentName = (resident: { first_name: string; last_name: string; full_name?: string }) => {
        return resident.full_name || `${resident.first_name} ${resident.last_name}`.trim();
    };

    return (
        <>
            {/* Clearance Type Filter */}
            {availableClearanceTypes && availableClearanceTypes.length > 0 && (
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Clearance Type
                    </label>
                    <ModernSelect
                        value={clearanceTypeFilter}
                        onValueChange={onClearanceTypeChange}
                        placeholder="All clearance types"
                        options={[
                            { value: 'all', label: 'All Types' },
                            ...availableClearanceTypes.map(type => ({
                                value: type.id.toString(),
                                label: type.name
                            }))
                        ]}
                        disabled={loading}
                        icon={FileText}
                    />
                </div>
            )}

            {/* Resident Filter */}
            {householdResidents && householdResidents.length > 0 && (
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Resident
                    </label>
                    <ModernSelect
                        value={residentFilter}
                        onValueChange={onResidentChange}
                        placeholder="All residents"
                        options={[
                            { value: 'all', label: 'All Residents' },
                            ...householdResidents.map(resident => ({
                                value: resident.id.toString(),
                                label: getResidentName(resident)
                            }))
                        ]}
                        disabled={loading}
                        icon={Users}
                    />
                </div>
            )}

            {/* Urgency Filter */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Urgency
                </label>
                <ModernSelect
                    value={urgencyFilter}
                    onValueChange={onUrgencyChange}
                    placeholder="All urgency"
                    options={[
                        { value: 'all', label: 'All Urgency' },
                        { value: 'normal', label: 'Normal' },
                        { value: 'rush', label: 'Rush' },
                        { value: 'express', label: 'Express' },
                    ]}
                    disabled={loading}
                    icon={Flag}
                />
            </div>

            {/* Year Filter */}
            {availableYears && availableYears.length > 0 && (
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Year
                    </label>
                    <ModernSelect
                        value={yearFilter}
                        onValueChange={onYearChange}
                        placeholder="All years"
                        options={[
                            { value: 'all', label: 'All Years' },
                            ...availableYears.map(year => ({
                                value: year.toString(),
                                label: year.toString()
                            }))
                        ]}
                        disabled={loading}
                        icon={Calendar}
                    />
                </div>
            )}

        </>
    );
};