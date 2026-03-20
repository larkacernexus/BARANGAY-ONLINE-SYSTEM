// components/admin/residents/create/forms/PersonalInfoForm.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { UserPlus, Calendar, Users } from 'lucide-react';
import { ResidentFormData } from '@/components/admin/residents/create/hooks/useResidentForm';

interface Props {
    data: ResidentFormData;
    setData: (key: keyof ResidentFormData, value: any) => void;
    errors: Record<string, string>;
    genderOptions: Array<{value: string, label: string}>;
    civilStatusOptions: Array<{value: string, label: string}>;
}

export default function PersonalInfoForm({ 
    data, 
    setData, 
    errors, 
    genderOptions, 
    civilStatusOptions 
}: Props) {
    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 flex items-center justify-center">
                        <UserPlus className="h-3 w-3 text-white" />
                    </div>
                    Personal Information
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                    Basic details of the resident
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Name Fields */}
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="first_name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            First Name <span className="text-red-500">*</span>
                        </Label>
                        <Input 
                            id="first_name" 
                            placeholder="Juan" 
                            required 
                            value={data.first_name}
                            onChange={(e) => setData('first_name', e.target.value)}
                            className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
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
                            value={data.middle_name}
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
                            value={data.last_name}
                            onChange={(e) => setData('last_name', e.target.value)}
                            className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
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
                            placeholder="Jr." 
                            value={data.suffix}
                            onChange={(e) => setData('suffix', e.target.value)}
                            className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                        />
                    </div>
                </div>

                {/* Birth Details */}
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                        <Label htmlFor="birth_date" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Date of Birth <span className="text-red-500">*</span>
                        </Label>
                        <Input 
                            id="birth_date" 
                            type="date" 
                            required 
                            value={data.birth_date}
                            onChange={(e) => setData('birth_date', e.target.value)}
                            max={new Date().toISOString().split('T')[0]}
                            className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                        />
                        {errors.birth_date && (
                            <p className="text-sm text-red-600 dark:text-red-400">{errors.birth_date}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="age" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Age
                        </Label>
                        <Input 
                            id="age" 
                            type="number" 
                            placeholder="35" 
                            value={data.age || ''}
                            readOnly
                            className="bg-gray-50 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="gender" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Gender <span className="text-red-500">*</span>
                        </Label>
                        <select 
                            id="gender"
                            value={data.gender}
                            onChange={(e) => setData('gender', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                        >
                            <option value="">Select gender</option>
                            {genderOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        {errors.gender && (
                            <p className="text-sm text-red-600 dark:text-red-400">{errors.gender}</p>
                        )}
                    </div>
                </div>

                {/* Place of Birth */}
                <div className="space-y-2">
                    <Label htmlFor="place_of_birth" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Place of Birth
                    </Label>
                    <Input 
                        id="place_of_birth" 
                        placeholder="City/Municipality, Province" 
                        value={data.place_of_birth}
                        onChange={(e) => setData('place_of_birth', e.target.value)}
                        className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                    />
                </div>

                {/* Civil Status */}
                <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        Civil Status <span className="text-red-500">*</span>
                    </Label>
                    <RadioGroup 
                        value={data.civil_status}
                        onValueChange={(value) => setData('civil_status', value)}
                        className="flex flex-wrap gap-4"
                    >
                        {civilStatusOptions.map((option) => (
                            <div key={option.value} className="flex items-center space-x-2">
                                <RadioGroupItem
                                    id={`civil_status_${option.value}`}
                                    value={option.value}
                                    className="dark:border-gray-600"
                                />
                                <Label 
                                    htmlFor={`civil_status_${option.value}`} 
                                    className="cursor-pointer text-sm dark:text-gray-300"
                                >
                                    {option.label}
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                    {errors.civil_status && (
                        <p className="text-sm text-red-600 dark:text-red-400">{errors.civil_status}</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}