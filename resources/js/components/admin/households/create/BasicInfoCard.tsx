// components/admin/households/create/BasicInfoCard.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Home, Phone, Mail, Key, AlertCircle, Users, ArrowRight, Ban, Info } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useState, useEffect } from 'react';

interface Resident {
    id: number;
    first_name: string;
    last_name: string;
    middle_name?: string;
    household_status?: 'none' | 'member' | 'head';
    current_household?: {
        id: number;
        number: string;
        is_head: boolean;
        relationship: string;
    } | null;
}

interface Props {
    data: any;
    setData: (key: string, value: any) => void;
    errors: Record<string, string>;
    heads: Resident[];
}

export default function BasicInfoCard({ data, setData, errors, heads }: Props) {
    const [selectedHeadDetails, setSelectedHeadDetails] = useState<Resident | null>(null);

    // Update selected head details when head_resident_id changes
    useEffect(() => {
        if (data.head_resident_id) {
            const head = heads.find(h => h.id === data.head_resident_id);
            setSelectedHeadDetails(head || null);
        } else {
            setSelectedHeadDetails(null);
        }
    }, [data.head_resident_id, heads]);

    const handleHeadChange = (value: string) => {
        if (!value) {
            setData('head_of_family', '');
            setData('head_resident_id', null);
            setSelectedHeadDetails(null);
            return;
        }

        const selectedHead = heads.find(head => head.id.toString() === value);
        if (selectedHead) {
            const fullName = `${selectedHead.first_name} ${selectedHead.last_name}`.trim();
            setData('head_of_family', fullName);
            setData('head_resident_id', parseInt(value));
            setSelectedHeadDetails(selectedHead);
        }
    };

    // Get head status indicator
    const getHeadStatusIndicator = () => {
        if (!selectedHeadDetails) return null;

        // Check if this head is currently a member of another household
        if (selectedHeadDetails.household_status === 'member') {
            return {
                type: 'info',
                icon: <ArrowRight className="h-4 w-4 text-purple-500" />,
                title: 'Currently in Another Household',
                message: selectedHeadDetails.current_household 
                    ? `Currently a member of Household #${selectedHeadDetails.current_household.number} as ${selectedHeadDetails.current_household.relationship}. Will be transferred to become head of this new household.`
                    : 'Currently a member of another household. Will be transferred to become head of this new household.',
                className: 'bg-purple-50 border-purple-200 text-purple-800 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-300',
                iconBg: 'bg-purple-100 dark:bg-purple-900/30'
            };
        }

        // Not in any household
        return {
            type: 'none',
            icon: <Users className="h-4 w-4 text-gray-500" />,
            title: 'Not in Any Household',
            message: 'This person is not currently part of any household.',
            className: 'bg-gray-50 border-gray-200 text-gray-800 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300',
            iconBg: 'bg-gray-100 dark:bg-gray-700'
        };
    };

    const statusIndicator = getHeadStatusIndicator();

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
                    
                    {/* Head Selection Dropdown */}
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
                                    const isMemberOfOther = head.household_status === 'member';
                                    
                                    return (
                                        <SelectItem 
                                            key={head.id} 
                                            value={head.id.toString()} 
                                            className={`dark:text-gray-300 dark:focus:bg-gray-700 ${
                                                isMemberOfOther ? 'text-purple-600 dark:text-purple-400' : ''
                                            }`}
                                        >
                                            <div className="flex items-center justify-between w-full">
                                                <span>{fullName}</span>
                                                {isMemberOfOther && head.current_household && (
                                                    <Badge variant="outline" className="ml-2 bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 text-xs">
                                                        <Users className="h-3 w-3 mr-1" />
                                                        HH #{head.current_household.number}
                                                    </Badge>
                                                )}
                                                {!isMemberOfOther && (
                                                    <Badge variant="outline" className="ml-2 bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 text-xs">
                                                        No Household
                                                    </Badge>
                                                )}
                                            </div>
                                        </SelectItem>
                                    );
                                })
                            )}
                        </SelectContent>
                    </Select>
                    
                    {errors.head_resident_id && (
                        <p className="text-sm text-red-600 dark:text-red-400">{errors.head_resident_id}</p>
                    )}
                    
                    {/* Status Indicator for Selected Head */}
                    {statusIndicator && (
                        <TooltipProvider>
                            <div className={`mt-3 p-3 rounded-lg border ${statusIndicator.className}`}>
                                <div className="flex items-start gap-3">
                                    <div className={`h-8 w-8 rounded-full ${statusIndicator.iconBg} flex items-center justify-center flex-shrink-0`}>
                                        {statusIndicator.icon}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-sm font-medium">
                                                {statusIndicator.title}
                                            </h4>
                                            {selectedHeadDetails?.current_household && (
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Info className="h-4 w-4 text-gray-400 cursor-help" />
                                                    </TooltipTrigger>
                                                    <TooltipContent className="max-w-xs">
                                                        <p className="font-medium mb-1">Household Details:</p>
                                                        <p>Number: #{selectedHeadDetails.current_household.number}</p>
                                                        <p>Relationship: {selectedHeadDetails.current_household.relationship}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            )}
                                        </div>
                                        <p className="text-xs mt-1 opacity-90">
                                            {statusIndicator.message}
                                        </p>
                                        
                                        {/* Show current household details if member */}
                                        {selectedHeadDetails?.household_status === 'member' && selectedHeadDetails.current_household && (
                                            <div className="mt-2 text-xs border-t border-purple-200 dark:border-purple-800 pt-2">
                                                <span className="font-medium">Current Household:</span>{' '}
                                                #{selectedHeadDetails.current_household.number} as {selectedHeadDetails.current_household.relationship}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </TooltipProvider>
                    )}
                    
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {heads.length === 0 && (
                            <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                                <AlertCircle className="h-3 w-3" />
                                All residents already belong to households. <Link href="/residents/create" className="text-blue-600 dark:text-blue-400 hover:underline">Create a new resident</Link>
                            </div>
                        )}
                    </div>
                    
                    {/* Manual Entry Option */}
                    <div className="relative mt-4">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t dark:border-gray-700" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white dark:bg-gray-900 px-2 text-gray-500 dark:text-gray-400">
                                Or enter manually
                            </span>
                        </div>
                    </div>
                    
                    <Input 
                        value={data.head_of_family}
                        onChange={(e) => {
                            setData('head_of_family', e.target.value);
                            // Clear selected head if manually entering
                            if (data.head_resident_id) {
                                setData('head_resident_id', null);
                                setSelectedHeadDetails(null);
                            }
                        }}
                        placeholder="Enter head of family name manually"
                        className="mt-2 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                    />
                    {errors.head_of_family && (
                        <p className="text-sm text-red-600 dark:text-red-400">{errors.head_of_family}</p>
                    )}
                    
                    {/* Helper text for manual entry */}
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Manual entry is useful if the resident is not yet registered in the system.
                    </p>
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