// components/admin/officials/edit/basic-info-tab.tsx
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { Resident } from '@/types/admin/officials/officials';
import { ChevronsUpDown, Phone, User, X, UserCheck } from 'lucide-react';
import { useState, useMemo } from 'react';

interface BasicInfoTabProps {
    formData: any;
    errors: Record<string, string>;
    availableResidents: Resident[];
    selectedResident: Resident | null;
    onResidentSelect: (residentId: number | null) => void;
    isSubmitting: boolean;
}

export function BasicInfoTab({ 
    formData, 
    errors, 
    availableResidents, 
    selectedResident,
    onResidentSelect, 
    isSubmitting 
}: BasicInfoTabProps) {
    const [residentOpen, setResidentOpen] = useState(false);
    const [residentSearch, setResidentSearch] = useState('');

    const getInitials = (firstName: string, lastName: string) => {
        if (!firstName || !lastName) return '?';
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    const formatFullName = (resident: Resident) => {
        const lastName = resident.last_name || '';
        const firstName = resident.first_name || '';
        const middleName = resident.middle_name ? ' ' + resident.middle_name.charAt(0) + '.' : '';
        return `${lastName}, ${firstName}${middleName}`;
    };

    const filteredResidents = useMemo(() => {
        if (!availableResidents || availableResidents.length === 0) {
            return [];
        }
        
        if (!residentSearch || residentSearch.trim() === '') {
            return availableResidents;
        }
        
        const search = residentSearch.toLowerCase().trim();
        
        return availableResidents.filter(resident => {
            const fullName = `${resident.first_name} ${resident.last_name}`.toLowerCase();
            const fullNameReversed = `${resident.last_name} ${resident.first_name}`.toLowerCase();
            const nameMatch = fullName.includes(search) || fullNameReversed.includes(search);
            const contactMatch = resident.contact_number?.toLowerCase().includes(search) || false;
            const emailMatch = resident.email?.toLowerCase().includes(search) || false;
            
            return nameMatch || contactMatch || emailMatch;
        });
    }, [availableResidents, residentSearch]);

    const handleResidentSelect = (residentId: string) => {
        onResidentSelect(parseInt(residentId));
        setResidentOpen(false);
        setResidentSearch('');
    };

    const clearResident = () => {
        onResidentSelect(null);
        setResidentSearch('');
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label className="dark:text-gray-300">
                    Select Resident <span className="text-red-500">*</span>
                </Label>
                
                {!selectedResident ? (
                    <Popover open={residentOpen} onOpenChange={setResidentOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={residentOpen}
                                className="w-full justify-between dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                disabled={isSubmitting}
                            >
                                <span className="truncate">
                                    {residentSearch || "Search and select a resident..."}
                                </span>
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[400px] p-0 dark:bg-gray-900 dark:border-gray-700">
                            <Command className="dark:bg-gray-900" shouldFilter={false}>
                                <CommandInput 
                                    placeholder="Search by name or contact number..." 
                                    value={residentSearch}
                                    onValueChange={setResidentSearch}
                                    className="dark:text-gray-300"
                                />
                                <CommandList>
                                    <CommandEmpty className="py-6 text-center text-sm">
                                        <User className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                        <p className="text-gray-500 dark:text-gray-400">No residents found</p>
                                    </CommandEmpty>
                                    <CommandGroup>
                                        {filteredResidents.map((resident) => (
                                            <CommandItem
                                                key={resident.id}
                                                value={resident.id.toString()}
                                                onSelect={() => handleResidentSelect(resident.id.toString())}
                                                className="cursor-pointer"
                                            >
                                                <div className="flex items-center gap-3 w-full">
                                                    <Avatar className="h-8 w-8">
                                                        {resident.photo_url ? (
                                                            <AvatarImage src={resident.photo_url} />
                                                        ) : null}
                                                        <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-500 text-white text-xs">
                                                            {getInitials(resident.first_name, resident.last_name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1">
                                                        <div className="font-medium dark:text-gray-200">
                                                            {formatFullName(resident)}
                                                        </div>
                                                        {resident.contact_number && (
                                                            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                                                                <Phone className="h-3 w-3" />
                                                                {resident.contact_number}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                ) : (
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg opacity-20 group-hover:opacity-30 transition duration-300 blur"></div>
                        <div className="relative p-4 border rounded-lg bg-white dark:bg-gray-900 dark:border-gray-700">
                            <div className="flex items-start gap-3">
                                <Avatar className="h-12 w-12">
                                    {selectedResident.photo_url ? (
                                        <AvatarImage src={selectedResident.photo_url} />
                                    ) : null}
                                    <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-500 text-white text-lg">
                                        {getInitials(selectedResident.first_name, selectedResident.last_name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="font-medium dark:text-gray-200">
                                                {formatFullName(selectedResident)}
                                            </p>
                                            {selectedResident.contact_number && (
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                                                    <Phone className="h-3 w-3" />
                                                    {selectedResident.contact_number}
                                                </p>
                                            )}
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={clearResident}
                                            className="text-red-600 hover:text-red-700 dark:text-red-400"
                                            disabled={isSubmitting}
                                        >
                                            <X className="h-4 w-4" />
                                            Change
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                {errors.resident_id && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.resident_id}</p>
                )}
            </div>

            {/* Help Card */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                    <UserCheck className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div className="flex-1">
                        <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Resident Requirements</h4>
                        <ul className="list-disc list-inside space-y-1 text-xs text-blue-700 dark:text-blue-300">
                            <li>Must be a registered resident of the barangay</li>
                            <li>Must be at least 18 years old</li>
                            <li>Must have no pending legal cases</li>
                            <li>Should be in good standing within the community</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}