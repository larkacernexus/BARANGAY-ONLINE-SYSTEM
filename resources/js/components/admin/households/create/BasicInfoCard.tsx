// components/admin/households/create/BasicInfoCard.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Home, Phone, Mail, Key, AlertCircle, Users } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface Resident {
    id: number;
    first_name: string;
    last_name: string;
}

interface Props {
    data: any;
    setData: (key: string, value: any) => void;
    errors: Record<string, string>;
    heads: Resident[];
}

export default function BasicInfoCard({ data, setData, errors, heads }: Props) {
    const handleHeadChange = (value: string) => {
        if (!value) {
            setData('head_of_family', '');
            setData('head_resident_id', null);
            return;
        }

        const selectedHead = heads.find(head => head.id.toString() === value);
        if (selectedHead) {
            const fullName = `${selectedHead.first_name} ${selectedHead.last_name}`.trim();
            setData('head_of_family', fullName);
            setData('head_resident_id', parseInt(value));
        }
    };

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 flex items-center justify-center">
                        <Home className="h-3 w-3 text-white" />
                    </div>
                    Basic Household Information
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                    Enter the household's basic details
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="householdNumber" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Household Number
                        </Label>
                        <Input 
                            id="householdNumber" 
                            placeholder="Auto-generated if empty"
                            value={data.household_number}
                            onChange={(e) => setData('household_number', e.target.value)}
                            className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                        />
                        {errors.household_number && (
                            <p className="text-sm text-red-600 dark:text-red-400">{errors.household_number}</p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Format: HH-YYYY-XXXXX
                        </p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="registrationDate" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Registration Date <span className="text-red-500">*</span>
                        </Label>
                        <Input 
                            id="registrationDate" 
                            type="date" 
                            required 
                            defaultValue={new Date().toISOString().split('T')[0]}
                            readOnly
                            className="bg-gray-50 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600 cursor-not-allowed"
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <Label htmlFor="head_resident_id" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Head of Family <span className="text-red-500">*</span>
                    </Label>
                    <Select 
                        value={data.head_resident_id?.toString() || ''}
                        onValueChange={handleHeadChange}
                    >
                        <SelectTrigger className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300">
                            <SelectValue placeholder="Select or search for head of family" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                            {heads.length === 0 ? (
                                <div className="px-2 py-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                                    <AlertCircle className="h-4 w-4 inline-block mr-1" />
                                    No available residents to select as head
                                </div>
                            ) : (
                                heads.map((head) => {
                                    const fullName = `${head.first_name} ${head.last_name}`.trim();
                                    return (
                                        <SelectItem key={head.id} value={head.id.toString()} className="dark:text-gray-300 dark:focus:bg-gray-700">
                                            {fullName}
                                        </SelectItem>
                                    );
                                })
                            )}
                        </SelectContent>
                    </Select>
                    {errors.head_resident_id && (
                        <p className="text-sm text-red-600 dark:text-red-400">{errors.head_resident_id}</p>
                    )}
                    
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {heads.length === 0 && (
                            <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                                <AlertCircle className="h-3 w-3" />
                                All residents already belong to households. <Link href="/residents/create" className="text-blue-600 dark:text-blue-400 hover:underline">Create a new resident</Link>
                            </div>
                        )}
                    </div>
                    
                    <Input 
                        value={data.head_of_family}
                        onChange={(e) => setData('head_of_family', e.target.value)}
                        placeholder="Or enter name manually"
                        className="mt-2 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                    />
                    {errors.head_of_family && (
                        <p className="text-sm text-red-600 dark:text-red-400">{errors.head_of_family}</p>
                    )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="contactNumber" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Contact Number <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                            <Input 
                                id="contactNumber" 
                                placeholder="09123456789" 
                                className="pl-10 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300" 
                                required 
                                value={data.contact_number}
                                onChange={(e) => setData('contact_number', e.target.value)}
                            />
                        </div>
                        {errors.contact_number && (
                            <p className="text-sm text-red-600 dark:text-red-400">{errors.contact_number}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Email Address
                        </Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                            <Input 
                                id="email" 
                                type="email" 
                                placeholder="family@example.com" 
                                className="pl-10 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300" 
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                            />
                        </div>
                        {errors.email && (
                            <p className="text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                        )}
                    </div>
                </div>
                
                {/* User Account Creation */}
                <div className="space-y-3 pt-4 border-t dark:border-gray-700">
                    <div className="flex items-center space-x-2">
                        <Checkbox 
                            id="create_user_account" 
                            checked={data.create_user_account}
                            onCheckedChange={(checked) => setData('create_user_account', checked as boolean)}
                            className="dark:border-gray-600"
                        />
                        <Label htmlFor="create_user_account" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            <div className="flex items-center gap-2">
                                <Key className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                Create User Account for Head
                            </div>
                        </Label>
                    </div>
                    
                    {data.create_user_account && (
                        <div className="mt-2 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                            <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                                User Account Details:
                            </p>
                            <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1 list-disc list-inside">
                                <li>Username: Generated from name (e.g., juan.delacruz)</li>
                                <li>Initial password: Full contact number</li>
                                <li>Will be required to change password on first login</li>
                                <li>Email notifications will be sent if email is provided</li>
                            </ul>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}