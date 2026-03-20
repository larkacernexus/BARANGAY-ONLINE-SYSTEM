// components/admin/residents/create/forms/HouseholdSection.tsx
import { CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Home, Users, AlertCircle } from 'lucide-react';
import { ResidentFormData } from '@/components/admin/residents/create/hooks/useResidentForm';

interface Household {
    id: number;
    household_number: string;
    head_name: string;
    has_head: boolean;
}

interface Props {
    data: ResidentFormData;
    setData: (key: keyof ResidentFormData, value: any) => void;
    errors: Record<string, string>;
    householdCreationOptions: Array<{value: string, label: string}>;
    existingHouseholds: Household[];
    relationshipOptions: Array<{value: string, label: string}>;
}

export default function HouseholdSection({ 
    data, 
    setData, 
    errors, 
    householdCreationOptions, 
    existingHouseholds,
    relationshipOptions 
}: Props) {
    const selectedHousehold = existingHouseholds.find(h => h.id === data.household_id);
    const canBeHead = selectedHousehold && !selectedHousehold.has_head;

    const getAvailableRelationships = () => {
        if (data.household_option === 'new' || data.household_option === 'none') {
            return relationshipOptions.filter(option => option.value === 'head');
        } else if (data.household_option === 'existing' && selectedHousehold) {
            return selectedHousehold.has_head 
                ? relationshipOptions.filter(option => option.value !== 'head')
                : relationshipOptions;
        }
        return relationshipOptions;
    };

    return (
        <CardContent className="space-y-6 pt-4 border-t dark:border-gray-700">
            {/* Household Option */}
            <div className="space-y-3">
                <Label htmlFor="household_option" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                    <Home className="h-4 w-4" />
                    Household Assignment <span className="text-red-500">*</span>
                </Label>
                <RadioGroup 
                    value={data.household_option}
                    onValueChange={(value: 'none' | 'new' | 'existing') => {
                        setData('household_option', value);
                        if (value !== 'existing') {
                            setData('household_id', null);
                        }
                        if (value !== 'new') {
                            setData('new_household_name', '');
                        }
                        if (value !== 'existing') {
                            setData('relationship_to_head', '');
                        }
                    }}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-3"
                >
                    {householdCreationOptions.map((option) => (
                        <div 
                            key={option.value} 
                            className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer transition-all ${
                                data.household_option === option.value 
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700' 
                                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900'
                            }`}
                            onClick={() => setData('household_option', option.value as any)}
                        >
                            <RadioGroupItem
                                id={`household_option_${option.value}`}
                                value={option.value}
                                className="dark:border-gray-600"
                            />
                            <Label 
                                htmlFor={`household_option_${option.value}`} 
                                className="cursor-pointer text-sm dark:text-gray-300 flex-1"
                            >
                                {option.label}
                            </Label>
                        </div>
                    ))}
                </RadioGroup>
            </div>

            {/* New Household Name Input */}
            {data.household_option === 'new' && (
                <div className="space-y-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <Label htmlFor="new_household_name" className="text-sm font-medium text-blue-700 dark:text-blue-400">
                        New Household Name <span className="text-red-500">*</span>
                    </Label>
                    <Input 
                        id="new_household_name" 
                        placeholder="Enter household name (e.g., Dela Cruz Family)" 
                        value={data.new_household_name}
                        onChange={(e) => setData('new_household_name', e.target.value)}
                        className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                    />
                    <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
                        <Home className="h-3 w-3" />
                        This resident will be the head of the new household
                    </p>
                    {errors.new_household_name && (
                        <p className="text-sm text-red-600 dark:text-red-400">{errors.new_household_name}</p>
                    )}
                </div>
            )}

            {/* Existing Household Selection */}
            {data.household_option === 'existing' && (
                <div className="space-y-3">
                    <Label htmlFor="household_id" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Select Existing Household <span className="text-red-500">*</span>
                    </Label>
                    <select 
                        id="household_id"
                        value={data.household_id?.toString() || ''}
                        onChange={(e) => setData('household_id', e.target.value ? parseInt(e.target.value) : null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                    >
                        <option value="">Select household</option>
                        {existingHouseholds.map((household) => (
                            <option key={household.id} value={household.id}>
                                {household.household_number} - {household.head_name}
                                {!household.has_head && ' (No Head)'}
                            </option>
                        ))}
                    </select>
                    {errors.household_id && (
                        <p className="text-sm text-red-600 dark:text-red-400">{errors.household_id}</p>
                    )}
                </div>
            )}

            {/* Relationship to Head Dropdown */}
            {data.household_option === 'existing' && data.household_id && (
                <div className="space-y-3">
                    <Label htmlFor="relationship_to_head" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Relationship to Head of Household <span className="text-red-500">*</span>
                    </Label>
                    {canBeHead && (
                        <div className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 mb-2">
                            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            <span className="text-xs text-amber-700 dark:text-amber-400">
                                This household has no head. Select "Head of Household" to set this resident as head.
                            </span>
                        </div>
                    )}
                    <select 
                        id="relationship_to_head"
                        value={data.relationship_to_head}
                        onChange={(e) => setData('relationship_to_head', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                    >
                        <option value="">Select relationship</option>
                        {getAvailableRelationships().map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    {errors.relationship_to_head && (
                        <p className="text-sm text-red-600 dark:text-red-400">{errors.relationship_to_head}</p>
                    )}
                </div>
            )}

            {/* Display relationship info for new/no household */}
            {(data.household_option === 'new' || data.household_option === 'none') && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-3">
                        <Home className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                                {data.household_option === 'new' 
                                    ? 'Creating New Household' 
                                    : 'No Household Assignment'}
                            </p>
                            <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                                {data.household_option === 'new' 
                                    ? 'This resident will create and head a new household' 
                                    : 'This resident will not be assigned to any household'}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </CardContent>
    );
}