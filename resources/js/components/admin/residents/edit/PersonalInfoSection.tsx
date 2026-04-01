// components/admin/residents/edit/PersonalInfoSection.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Calendar } from 'lucide-react';

// Import types from main types file
import { ResidentFormData } from '@/types/admin/residents/residents-types';

interface Props {
    data: ResidentFormData;
    setData: (key: keyof ResidentFormData, value: any) => void;
    errors: Record<string, string>;
    genderOptions: Array<{value: string, label: string}>;
    civilStatusOptions: Array<{value: string, label: string}>;
    formatDisplayDate: (date: string) => string;
}

// Helper function to safely get input value - always returns string
const getInputValue = (value: string | number | null | undefined): string => {
    if (value === null || value === undefined) return '';
    return String(value);
};

export default function PersonalInfoSection({ 
    data, 
    setData, 
    errors, 
    genderOptions, 
    civilStatusOptions,
    formatDisplayDate 
}: Props) {
    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 flex items-center justify-center">
                        <User className="h-3 w-3 text-white" />
                    </div>
                    Personal Information
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                    Basic details of the resident
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="first_name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            First Name <span className="text-red-500">*</span>
                        </Label>
                        <Input 
                            id="first_name" 
                            placeholder="Juan" 
                            required 
                            value={getInputValue(data.first_name)}
                            onChange={(e) => setData('first_name', e.target.value)}
                            className={`dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 ${errors.first_name ? 'border-red-500 dark:border-red-800' : ''}`}
                        />
                        {errors.first_name && (
                            <p className="text-sm text-red-600 dark:text-red-400">{errors.first_name}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="middle_name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Middle Name
                        </Label>
                        <Input 
                            id="middle_name" 
                            placeholder="Santos" 
                            value={getInputValue(data.middle_name)}
                            onChange={(e) => setData('middle_name', e.target.value)}
                            className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="last_name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Last Name <span className="text-red-500">*</span>
                        </Label>
                        <Input 
                            id="last_name" 
                            placeholder="Dela Cruz" 
                            required 
                            value={getInputValue(data.last_name)}
                            onChange={(e) => setData('last_name', e.target.value)}
                            className={`dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 ${errors.last_name ? 'border-red-500 dark:border-red-800' : ''}`}
                        />
                        {errors.last_name && (
                            <p className="text-sm text-red-600 dark:text-red-400">{errors.last_name}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="suffix" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Suffix
                        </Label>
                        <Input 
                            id="suffix" 
                            placeholder="Jr., Sr., III" 
                            value={getInputValue(data.suffix)}
                            onChange={(e) => setData('suffix', e.target.value)}
                            className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                        />
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                        <Label htmlFor="birth_date" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                            Date of Birth <span className="text-red-500">*</span>
                        </Label>
                        <Input 
                            id="birth_date" 
                            type="date" 
                            required 
                            value={getInputValue(data.birth_date)}
                            onChange={(e) => setData('birth_date', e.target.value)}
                            max={new Date().toISOString().split('T')[0]}
                            className={`dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 ${errors.birth_date ? 'border-red-500 dark:border-red-800' : ''}`}
                        />
                        {errors.birth_date && (
                            <p className="text-sm text-red-600 dark:text-red-400">{errors.birth_date}</p>
                        )}
                        {data.birth_date && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {formatDisplayDate(data.birth_date)} • {data.age} years old
                            </p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="age" className="text-sm font-medium text-gray-700 dark:text-gray-300">Age</Label>
                        <Input 
                            id="age" 
                            type="number" 
                            min="0"
                            max="120"
                            value={getInputValue(data.age)}
                            readOnly
                            className="bg-gray-50 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600 cursor-not-allowed"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="gender" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Gender <span className="text-red-500">*</span>
                        </Label>
                        <Select 
                            value={data.gender ?? undefined}
                            onValueChange={(value) => setData('gender', value as any)}
                        >
                            <SelectTrigger className={`dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 ${errors.gender ? 'border-red-500 dark:border-red-800' : ''}`}>
                                <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                                {genderOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value} className="dark:text-gray-300 dark:focus:bg-gray-700">
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.gender && (
                            <p className="text-sm text-red-600 dark:text-red-400">{errors.gender}</p>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="place_of_birth" className="text-sm font-medium text-gray-700 dark:text-gray-300">Place of Birth</Label>
                    <Input 
                        id="place_of_birth" 
                        placeholder="City/Municipality, Province" 
                        value={getInputValue(data.place_of_birth)}
                        onChange={(e) => setData('place_of_birth', e.target.value)}
                        className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Civil Status <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex flex-wrap gap-4">
                        {civilStatusOptions.map((option) => (
                            <div key={option.value} className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    id={`civil_status_${option.value}`}
                                    name="civil_status"
                                    value={option.value}
                                    checked={data.civil_status === option.value}
                                    onChange={() => setData('civil_status', option.value as any)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-900"
                                />
                                <Label htmlFor={`civil_status_${option.value}`} className="cursor-pointer text-sm dark:text-gray-300">
                                    {option.label}
                                </Label>
                            </div>
                        ))}
                    </div>
                    {errors.civil_status && (
                        <p className="text-sm text-red-600 dark:text-red-400">{errors.civil_status}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="status" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Status <span className="text-red-500">*</span>
                    </Label>
                    <Select 
                        value={data.status}
                        onValueChange={(value) => setData('status', value as any)}
                    >
                        <SelectTrigger className={`dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 ${errors.status ? 'border-red-500 dark:border-red-800' : ''}`}>
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                            <SelectItem value="active" className="text-green-600 dark:text-green-400 dark:focus:bg-gray-700">
                                Active
                            </SelectItem>
                            <SelectItem value="inactive" className="text-amber-600 dark:text-amber-400 dark:focus:bg-gray-700">
                                Inactive
                            </SelectItem>
                            <SelectItem value="pending" className="text-yellow-600 dark:text-yellow-400 dark:focus:bg-gray-700">
                                Pending
                            </SelectItem>
                            <SelectItem value="suspended" className="text-red-600 dark:text-red-400 dark:focus:bg-gray-700">
                                Suspended
                            </SelectItem>
                        </SelectContent>
                    </Select>
                    {errors.status && (
                        <p className="text-sm text-red-600 dark:text-red-400">{errors.status}</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}