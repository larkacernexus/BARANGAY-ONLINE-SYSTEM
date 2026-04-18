// components/admin/officials/shared/resident-selection.tsx
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Home, Mail, Phone, Users, Check, ChevronsUpDown, Search, X, Filter, MapPin, Calendar, UserCircle, Clock, Loader2 } from 'lucide-react';
import { Resident } from '@/components/admin/officials/shared/types/official';
import { useState, useMemo, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
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
    CommandSeparator,
    CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

interface ResidentSelectionProps {
    residents: Resident[];
    selectedResidentId: number | null;
    selectedResident: Resident | null;
    onResidentSelect: (residentId: number) => void;
    error?: string;
    isLoading?: boolean;
    disabled?: boolean;
}

// Get initials from name
const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

// Format full name
const formatFullName = (resident: Resident) => {
    return `${resident.last_name}, ${resident.first_name}${resident.middle_name ? ' ' + resident.middle_name.charAt(0) + '.' : ''}`;
};

export function ResidentSelection({ 
    residents, 
    selectedResidentId, 
    selectedResident, 
    onResidentSelect,
    error,
    isLoading = false,
    disabled = false
}: ResidentSelectionProps) {
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [recentlySelected, setRecentlySelected] = useState<number[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    // Focus input when popover opens
    useEffect(() => {
        if (open && !disabled) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    }, [open, disabled]);

    // Track recently selected residents (max 3)
    useEffect(() => {
        if (selectedResidentId && !recentlySelected.includes(selectedResidentId)) {
            setRecentlySelected(prev => {
                const newList = [selectedResidentId, ...prev.filter(id => id !== selectedResidentId)].slice(0, 3);
                return newList;
            });
        }
    }, [selectedResidentId]);

    // Filter residents based on search term with advanced matching
    const filteredResidents = useMemo(() => {
        if (!searchTerm.trim()) return residents;
        
        const searchLower = searchTerm.toLowerCase().trim();
        const searchWords = searchLower.split(/\s+/).filter(word => word.length > 0);
        
        return residents.filter(resident => {
            const fullName = `${resident.first_name} ${resident.middle_name || ''} ${resident.last_name}`.toLowerCase();
            const fullNameReversed = `${resident.last_name} ${resident.first_name} ${resident.middle_name || ''}`.toLowerCase();
            const purokName = resident.purok?.name?.toLowerCase() || '';
            const age = resident.age?.toString() || '';
            const gender = resident.gender?.toLowerCase() || '';
            
            return searchWords.every(word => 
                fullName.includes(word) || 
                fullNameReversed.includes(word) ||
                purokName.includes(word) ||
                age.includes(word) ||
                gender.includes(word)
            );
        });
    }, [residents, searchTerm]);

    // Get recent residents objects
    const recentResidents = useMemo(() => {
        return recentlySelected
            .map(id => residents.find(r => r.id === id))
            .filter((r): r is Resident => r !== undefined);
    }, [recentlySelected, residents]);

    const handleSelect = (residentId: number) => {
        onResidentSelect(residentId);
        setOpen(false);
        setSearchTerm('');
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onResidentSelect(0);
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="space-y-4">
                <Label className="dark:text-gray-300">Resident *</Label>
                <Skeleton className="h-10 w-full dark:bg-gray-800" />
                <Skeleton className="h-24 w-full dark:bg-gray-800" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label className="dark:text-gray-300">
                        Resident <span className="text-red-500">*</span>
                    </Label>
                    {selectedResident && !disabled && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleClear}
                            className="h-6 px-2 text-xs text-gray-500 hover:text-red-500 dark:text-gray-400"
                        >
                            <X className="h-3 w-3 mr-1" />
                            Clear
                        </Button>
                    )}
                </div>
                
                <Popover open={open && !disabled} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            disabled={disabled}
                            className={cn(
                                "w-full justify-between h-auto min-h-10 py-2 px-3",
                                "dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300",
                                "hover:dark:border-gray-600 transition-colors",
                                error && "border-red-500 dark:border-red-500"
                            )}
                        >
                            {selectedResident ? (
                                <div className="flex items-center gap-3 w-full">
                                    <Avatar className="h-8 w-8 border dark:border-gray-700">
                                        {selectedResident.photo_url ? (
                                            <AvatarImage 
                                                src={selectedResident.photo_url} 
                                                alt={formatFullName(selectedResident)}
                                            />
                                        ) : null}
                                        <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-500 text-white text-xs">
                                            {getInitials(selectedResident.first_name, selectedResident.last_name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 text-left">
                                        <div className="font-medium">
                                            {formatFullName(selectedResident)}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                            <span>{selectedResident.age} years</span>
                                            <span>•</span>
                                            <span>{selectedResident.gender}</span>
                                            {selectedResident.purok && (
                                                <>
                                                    <span>•</span>
                                                    <span>Purok {selectedResident.purok.name}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                    <Users className="h-4 w-4" />
                                    <span>Select resident</span>
                                </div>
                            )}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[450px] p-0 dark:bg-gray-900 dark:border-gray-700" align="start">
                        <Command className="dark:bg-gray-900">
                            <div className="flex items-center border-b dark:border-gray-700 px-3">
                                <Search className="mr-2 h-4 w-4 shrink-0 text-gray-500 dark:text-gray-400" />
                                <CommandInput
                                    ref={inputRef}
                                    placeholder="Search by name, purok, age, gender..."
                                    className="flex-1 h-11 dark:text-gray-300 dark:placeholder:text-gray-500"
                                    value={searchTerm}
                                    onValueChange={setSearchTerm}
                                />
                                {searchTerm && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0"
                                        onClick={() => setSearchTerm('')}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                            
                            <CommandList className="max-h-[400px]">
                                {recentResidents.length > 0 && !searchTerm && (
                                    <>
                                        <div className="px-2 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            Recent
                                        </div>
                                        <CommandGroup>
                                            {recentResidents.map((resident) => (
                                                <CommandItem
                                                    key={`recent-${resident.id}`}
                                                    value={`recent-${resident.id}`}
                                                    onSelect={() => handleSelect(resident.id)}
                                                    className="dark:text-gray-300 dark:hover:bg-gray-800"
                                                >
                                                    <div className="flex items-center gap-2 w-full">
                                                        <Avatar className="h-6 w-6">
                                                            {resident.photo_url ? (
                                                                <AvatarImage src={resident.photo_url} />
                                                            ) : null}
                                                            <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-xs">
                                                                {getInitials(resident.first_name, resident.last_name)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1">
                                                            <span className="font-medium">
                                                                {formatFullName(resident)}
                                                            </span>
                                                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                                                                ({resident.age} yrs)
                                                            </span>
                                                        </div>
                                                    </div>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                        <CommandSeparator className="dark:bg-gray-700" />
                                    </>
                                )}

                                <CommandEmpty className="py-8 text-center">
                                    <div className="space-y-3">
                                        <div className="bg-gray-100 dark:bg-gray-800 rounded-full w-12 h-12 mx-auto flex items-center justify-center">
                                            <Users className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium dark:text-gray-300">No residents found</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                Try adjusting your search terms
                                            </p>
                                        </div>
                                    </div>
                                </CommandEmpty>

                                <CommandGroup className="overflow-y-auto">
                                    {filteredResidents.map((resident, index) => (
                                        <CommandItem
                                            key={resident.id}
                                            value={`${resident.last_name} ${resident.first_name}`}
                                            onSelect={() => handleSelect(resident.id)}
                                            className={cn(
                                                "dark:text-gray-300 dark:hover:bg-gray-800",
                                                "border-b dark:border-gray-800 last:border-0"
                                            )}
                                        >
                                            <div className="flex items-start gap-3 w-full py-1">
                                                <div className="relative">
                                                    <Avatar className="h-10 w-10 border dark:border-gray-700">
                                                        {resident.photo_url ? (
                                                            <AvatarImage 
                                                                src={resident.photo_url} 
                                                                alt={formatFullName(resident)}
                                                            />
                                                        ) : null}
                                                        <AvatarFallback className="bg-gradient-to-br from-gray-600 to-gray-700 text-white text-xs">
                                                            {getInitials(resident.first_name, resident.last_name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    {selectedResidentId === resident.id && (
                                                        <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5">
                                                            <Check className="h-3 w-3 text-white" />
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="font-semibold dark:text-gray-200">
                                                            {formatFullName(resident)}
                                                        </span>
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1">
                                                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                                            <Calendar className="h-3 w-3" />
                                                            {resident.age} years
                                                        </div>
                                                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                                            <UserCircle className="h-3 w-3" />
                                                            {resident.gender}
                                                        </div>
                                                        {resident.purok && (
                                                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 col-span-2">
                                                                <MapPin className="h-3 w-3" />
                                                                Purok {resident.purok.name}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>

                                {filteredResidents.length > 0 && (
                                    <div className="border-t dark:border-gray-700 px-3 py-2 text-xs text-gray-500 dark:text-gray-400 flex justify-between items-center">
                                        <span>
                                            Showing {filteredResidents.length} of {residents.length} residents
                                        </span>
                                    </div>
                                )}
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
                
                {error && (
                    <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                        <span className="font-medium">•</span>
                        {error}
                    </p>
                )}
            </div>

            {selectedResident && (
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg opacity-20 group-hover:opacity-30 transition duration-300 blur"></div>
                    
                    <div className="relative p-4 border rounded-lg bg-white dark:bg-gray-900 dark:border-gray-700 shadow-sm">
                        <div className="flex items-start gap-4">
                            <Avatar className="h-16 w-16 border-2 border-amber-200 dark:border-amber-800 shadow-md">
                                {selectedResident.photo_url ? (
                                    <AvatarImage 
                                        src={selectedResident.photo_url} 
                                        alt={formatFullName(selectedResident)}
                                    />
                                ) : null}
                                <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-500 text-white text-lg">
                                    {getInitials(selectedResident.first_name, selectedResident.last_name)}
                                </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1">
                                <div>
                                    <h4 className="font-bold text-lg dark:text-gray-200">
                                        {formatFullName(selectedResident)}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                        <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                                            {selectedResident.age} years old
                                        </Badge>
                                        <Badge variant="outline" className="dark:border-gray-700 dark:text-gray-400">
                                            {selectedResident.gender}
                                        </Badge>
                                        {selectedResident.civil_status && (
                                            <Badge variant="outline" className="dark:border-gray-700 dark:text-gray-400">
                                                {selectedResident.civil_status}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                                    {selectedResident.contact_number && (
                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                            <div className="bg-gray-100 dark:bg-gray-800 p-1.5 rounded-full">
                                                <Phone className="h-3 w-3" />
                                            </div>
                                            <span>{selectedResident.contact_number}</span>
                                        </div>
                                    )}
                                    
                                    {selectedResident.email && (
                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                            <div className="bg-gray-100 dark:bg-gray-800 p-1.5 rounded-full">
                                                <Mail className="h-3 w-3" />
                                            </div>
                                            <span className="truncate">{selectedResident.email}</span>
                                        </div>
                                    )}
                                    
                                    {selectedResident.address && (
                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 col-span-2">
                                            <div className="bg-gray-100 dark:bg-gray-800 p-1.5 rounded-full">
                                                <Home className="h-3 w-3" />
                                            </div>
                                            <span>{selectedResident.address}</span>
                                        </div>
                                    )}
                                    
                                    {selectedResident.purok && (
                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 col-span-2">
                                            <div className="bg-gray-100 dark:bg-gray-800 p-1.5 rounded-full">
                                                <MapPin className="h-3 w-3" />
                                            </div>
                                            <span>Purok {selectedResident.purok.name}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {residents.length > 0 && (
                <div className="flex flex-wrap items-center gap-3 text-xs">
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 px-3 py-1.5 rounded-full">
                        <Users className="h-3.5 w-3.5" />
                        <span className="font-medium">{residents.length}</span>
                        <span>available</span>
                    </div>
                    
                    {searchTerm && (
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-full">
                            <Filter className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                            <span className="font-medium text-amber-600 dark:text-amber-400">{filteredResidents.length}</span>
                            <span className="text-amber-600 dark:text-amber-400">filtered</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}