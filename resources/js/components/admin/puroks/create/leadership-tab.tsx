// pages/admin/puroks/components/leadership-tab.tsx
import { useState, useMemo, useEffect } from 'react';
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
import { Resident } from '@/types/admin/puroks/purok';
import { ChevronsUpDown, Phone, User, X } from 'lucide-react';


interface LeadershipTabProps {
    formData: any;
    errors: Record<string, string>;
    availableResidents: Resident[]; // Fixed type
    onLeaderSelect: (leaderId: string) => void;
    isSubmitting: boolean;
}

export function LeadershipTab({ 
    formData, 
    errors, 
    availableResidents, 
    onLeaderSelect, 
    isSubmitting 
}: LeadershipTabProps) {
    const [leaderOpen, setLeaderOpen] = useState(false);
    const [leaderSearch, setLeaderSearch] = useState('');
    const [selectedLeader, setSelectedLeader] = useState<Resident | null>(null);

    // Get initials for avatar
    const getInitials = (firstName: string, lastName: string) => {
        if (!firstName || !lastName) return '?';
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    // Format full name (Last, First M.)
    const formatFullName = (resident: Resident) => {
        const lastName = resident.last_name || '';
        const firstName = resident.first_name || '';
        const middleName = resident.middle_name ? ' ' + resident.middle_name.charAt(0) + '.' : '';
        return `${lastName}, ${firstName}${middleName}`;
    };

    // Filter residents for leader selection
    const filteredResidents = useMemo(() => {
        if (!availableResidents || availableResidents.length === 0) {
            return [];
        }
        
        if (!leaderSearch || leaderSearch.trim() === '') {
            return availableResidents;
        }
        
        const search = leaderSearch.toLowerCase().trim();
        
        return availableResidents.filter(resident => {
            const fullName = `${resident.first_name} ${resident.last_name}`.toLowerCase();
            const fullNameReversed = `${resident.last_name} ${resident.first_name}`.toLowerCase();
            const nameMatch = fullName.includes(search) || fullNameReversed.includes(search);
            const contactMatch = resident.contact_number?.toLowerCase().includes(search) || false;
            const emailMatch = resident.email?.toLowerCase().includes(search) || false;
            
            return nameMatch || contactMatch || emailMatch;
        });
    }, [availableResidents, leaderSearch]);

    // Handle leader selection
    const handleLeaderSelect = (leaderId: string) => {
        onLeaderSelect(leaderId);
        const resident = availableResidents.find(r => r.id.toString() === leaderId);
        setSelectedLeader(resident || null);
        setLeaderOpen(false);
        setLeaderSearch('');
    };

    // Clear leader selection
    const clearLeader = () => {
        onLeaderSelect('');
        setSelectedLeader(null);
        setLeaderSearch('');
    };

    // Update selected leader when formData.leader_id changes externally
    useEffect(() => {
        if (formData.leader_id && availableResidents.length > 0) {
            const resident = availableResidents.find(r => r.id.toString() === formData.leader_id);
            if (resident && (!selectedLeader || selectedLeader.id !== resident.id)) {
                setSelectedLeader(resident);
            }
        } else if (!formData.leader_id && selectedLeader) {
            setSelectedLeader(null);
        }
    }, [formData.leader_id, availableResidents]);

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label className="dark:text-gray-300">Purok Leader</Label>
                
                {!selectedLeader ? (
                    <Popover open={leaderOpen} onOpenChange={setLeaderOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={leaderOpen}
                                className="w-full justify-between dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                disabled={isSubmitting}
                            >
                                <span className="truncate">
                                    {leaderSearch || "Search and select a resident..."}
                                </span>
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[400px] p-0 dark:bg-gray-900 dark:border-gray-700">
                            <Command className="dark:bg-gray-900" shouldFilter={false}>
                                <CommandInput 
                                    placeholder="Search by name or contact number..." 
                                    value={leaderSearch}
                                    onValueChange={setLeaderSearch}
                                    className="dark:text-gray-300"
                                />
                                <CommandList>
                                    <CommandEmpty className="py-6 text-center text-sm">
                                        <User className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                        <p className="text-gray-500 dark:text-gray-400">No residents found</p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                            Try a different search term
                                        </p>
                                    </CommandEmpty>
                                    <CommandGroup>
                                        {filteredResidents.map((resident) => (
                                            <CommandItem
                                                key={resident.id}
                                                value={resident.id.toString()}
                                                onSelect={() => handleLeaderSelect(resident.id.toString())}
                                                className="cursor-pointer"
                                            >
                                                <div className="flex items-center gap-3 w-full">
                                                    <Avatar className="h-8 w-8">
                                                        {resident.photo_url ? (
                                                            <AvatarImage src={resident.photo_url} />
                                                        ) : null}
                                                        <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white text-xs">
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
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg opacity-20 group-hover:opacity-30 transition duration-300 blur"></div>
                        <div className="relative p-4 border rounded-lg bg-white dark:bg-gray-900 dark:border-gray-700">
                            <div className="flex items-start gap-3">
                                <Avatar className="h-12 w-12">
                                    {selectedLeader.photo_url ? (
                                        <AvatarImage src={selectedLeader.photo_url} />
                                    ) : null}
                                    <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white text-lg">
                                        {getInitials(selectedLeader.first_name, selectedLeader.last_name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="font-medium dark:text-gray-200">
                                                {formatFullName(selectedLeader)}
                                            </p>
                                            {selectedLeader.contact_number && (
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                                                    <Phone className="h-3 w-3" />
                                                    {selectedLeader.contact_number}
                                                </p>
                                            )}
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={clearLeader}
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
                
                {errors.leader_id && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.leader_id}</p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    The purok leader will be responsible for coordinating with barangay officials and organizing community activities.
                </p>
            </div>

            {/* Help Card */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                    <div className="flex-1">
                        <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Leadership Role</h4>
                        <ul className="list-disc list-inside space-y-1 text-xs text-blue-700 dark:text-blue-300">
                            <li>Representing the purok in barangay meetings</li>
                            <li>Organizing community activities and clean-ups</li>
                            <li>Acting as a liaison between residents and barangay officials</li>
                            <li>Maintaining peace and order within the purok</li>
                            <li>Reporting concerns and issues to the barangay</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}