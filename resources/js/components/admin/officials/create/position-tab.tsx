// components/admin/officials/create/position-tab.tsx
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
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
import { Position, Committee, User, Resident } from '@/types/admin/officials/officials';
import { 
    Shield, 
    Calendar, 
    Briefcase, 
    ChevronsUpDown, 
    User as UserIcon,
    CheckCircle,
    AlertCircle,
    Users
} from 'lucide-react';
import { useState, useMemo } from 'react';

interface PositionTabProps {
    formData: any;
    errors: Record<string, string>;
    positions: Position[];
    committees: Committee[];
    availableUsers: User[];
    selectedResident: Resident | null;
    selectedPosition: Position | null;
    requiresAccount: boolean;
    requiresCommittee?: boolean; // Made optional
    onPositionChange: (positionId: number | null) => void;
    onCommitteeChange: (committeeId: number | null) => void;
    onTermStartChange: (value: string) => void;
    onTermEndChange: (value: string) => void;
    onStatusChange: (value: 'active' | 'inactive' | 'former') => void;
    onOrderChange: (value: number) => void;
    onResponsibilitiesChange: (value: string) => void;
    onUserSelect: (userId: number | null) => void;
    isSubmitting: boolean;
}

export function PositionTab({
    formData,
    errors,
    positions,
    committees,
    availableUsers,
    selectedResident,
    selectedPosition,
    requiresAccount,
    requiresCommittee = false, // Default value
    onPositionChange,
    onCommitteeChange,
    onTermStartChange,
    onTermEndChange,
    onStatusChange,
    onOrderChange,
    onResponsibilitiesChange,
    onUserSelect,
    isSubmitting
}: PositionTabProps) {
    const [userOpen, setUserOpen] = useState(false);
    const [userSearch, setUserSearch] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const filteredUsers = useMemo(() => {
        if (!availableUsers || availableUsers.length === 0) {
            return [];
        }
        
        if (!userSearch || userSearch.trim() === '') {
            return availableUsers;
        }
        
        const search = userSearch.toLowerCase().trim();
        
        return availableUsers.filter(user => {
            const nameMatch = user.name?.toLowerCase().includes(search) || false;
            const emailMatch = user.email?.toLowerCase().includes(search) || false;
            return nameMatch || emailMatch;
        });
    }, [availableUsers, userSearch]);

    const handleUserSelect = (userId: string) => {
        onUserSelect(parseInt(userId));
        const user = availableUsers.find(u => u.id === parseInt(userId));
        setSelectedUser(user || null);
        setUserOpen(false);
        setUserSearch('');
    };

    const clearUser = () => {
        onUserSelect(null);
        setSelectedUser(null);
        setUserSearch('');
    };

    return (
        <div className="space-y-6">
            {/* Position Selection */}
            <div className="space-y-2">
                <Label className="dark:text-gray-300">
                    Position <span className="text-red-500">*</span>
                </Label>
                <Select
                    value={formData.position_id?.toString() || ""}
                    onValueChange={(value) => onPositionChange(value ? parseInt(value) : null)}
                    disabled={isSubmitting || !selectedResident}
                >
                    <SelectTrigger className={`dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 ${errors.position_id ? 'border-destructive' : ''}`}>
                        <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                        {positions.map((position) => (
                            <SelectItem key={position.id} value={position.id.toString()} className="dark:text-gray-300">
                                <div className="flex items-center gap-2">
                                    <Shield className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                    {position.name}
                                    {position.requires_account && (
                                        <span className="text-xs text-blue-600 dark:text-blue-400 ml-2">
                                            (Requires Account)
                                        </span>
                                    )}
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors.position_id && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.position_id}</p>
                )}
                {!selectedResident && (
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                        Please select a resident first
                    </p>
                )}
            </div>

            {/* Committee Selection (conditional) */}
            {requiresCommittee && selectedPosition && (
                <div className="space-y-2">
                    <Label className="dark:text-gray-300">
                        Committee Assignment <span className="text-red-500">*</span>
                    </Label>
                    <Select
                        value={formData.committee_id?.toString() || ""}
                        onValueChange={(value) => onCommitteeChange(value ? parseInt(value) : null)}
                        disabled={isSubmitting}
                    >
                        <SelectTrigger className={`dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 ${errors.committee_id ? 'border-destructive' : ''}`}>
                            <SelectValue placeholder="Select committee" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                            {committees.map((committee) => (
                                <SelectItem key={committee.id} value={committee.id.toString()} className="dark:text-gray-300">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                        {committee.name}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.committee_id && (
                        <p className="text-sm text-red-600 dark:text-red-400">{errors.committee_id}</p>
                    )}
                </div>
            )}

            {/* Term Dates */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="dark:text-gray-300">
                        Term Start <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <Input
                            type="date"
                            value={formData.term_start}
                            onChange={(e) => onTermStartChange(e.target.value)}
                            className={`pl-10 ${errors.term_start ? 'border-destructive' : ''} dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300`}
                            disabled={isSubmitting}
                        />
                    </div>
                    {errors.term_start && (
                        <p className="text-sm text-red-600 dark:text-red-400">{errors.term_start}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label className="dark:text-gray-300">
                        Term End <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <Input
                            type="date"
                            value={formData.term_end}
                            onChange={(e) => onTermEndChange(e.target.value)}
                            className={`pl-10 ${errors.term_end ? 'border-destructive' : ''} dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300`}
                            disabled={isSubmitting}
                        />
                    </div>
                    {errors.term_end && (
                        <p className="text-sm text-red-600 dark:text-red-400">{errors.term_end}</p>
                    )}
                </div>
            </div>

            {/* Status and Order */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="dark:text-gray-300">Status</Label>
                    <Select
                        value={formData.status}
                        onValueChange={(value: 'active' | 'inactive' | 'former') => onStatusChange(value)}
                        disabled={isSubmitting}
                    >
                        <SelectTrigger className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300">
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                            <SelectItem value="active" className="dark:text-gray-300">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    Active
                                </div>
                            </SelectItem>
                            <SelectItem value="inactive" className="dark:text-gray-300">
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                                    Inactive
                                </div>
                            </SelectItem>
                            <SelectItem value="former" className="dark:text-gray-300">
                                Former
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label className="dark:text-gray-300">Display Order</Label>
                    <Input
                        type="number"
                        value={formData.order}
                        onChange={(e) => onOrderChange(parseInt(e.target.value) || 0)}
                        className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                        disabled={isSubmitting}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Determines listing priority
                    </p>
                </div>
            </div>

            {/* Responsibilities */}
            <div className="space-y-2">
                <Label className="dark:text-gray-300">Responsibilities</Label>
                <Textarea
                    value={formData.responsibilities}
                    onChange={(e) => onResponsibilitiesChange(e.target.value)}
                    placeholder="List the responsibilities and duties for this position..."
                    rows={3}
                    className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                    disabled={isSubmitting}
                />
            </div>

            {/* System Account Assignment */}
            {requiresAccount && selectedPosition && (
                <>
                    <div className="border-t dark:border-gray-700 pt-4">
                        <div className="space-y-2">
                            <Label className="dark:text-gray-300 flex items-center gap-2">
                                <UserIcon className="h-4 w-4" />
                                System Account Assignment <span className="text-red-500">*</span>
                            </Label>
                            
                            {!selectedUser ? (
                                <Popover open={userOpen} onOpenChange={setUserOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={userOpen}
                                            className="w-full justify-between dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                            disabled={isSubmitting}
                                        >
                                            <span className="truncate">
                                                {userSearch || "Select a system account..."}
                                            </span>
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[400px] p-0 dark:bg-gray-900 dark:border-gray-700">
                                        <Command className="dark:bg-gray-900" shouldFilter={false}>
                                            <CommandInput 
                                                placeholder="Search by name or email..." 
                                                value={userSearch}
                                                onValueChange={setUserSearch}
                                                className="dark:text-gray-300"
                                            />
                                            <CommandList>
                                                <CommandEmpty className="py-6 text-center text-sm">
                                                    <UserIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                                    <p className="text-gray-500 dark:text-gray-400">No users found</p>
                                                </CommandEmpty>
                                                <CommandGroup>
                                                    {filteredUsers.map((user) => (
                                                        <CommandItem
                                                            key={user.id}
                                                            value={user.id.toString()}
                                                            onSelect={() => handleUserSelect(user.id.toString())}
                                                            className="cursor-pointer"
                                                        >
                                                            <div className="flex items-center gap-3 w-full">
                                                                <Avatar className="h-8 w-8">
                                                                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-xs">
                                                                        {user.name?.charAt(0) || 'U'}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <div className="flex-1">
                                                                    <div className="font-medium dark:text-gray-200">
                                                                        {user.name}
                                                                    </div>
                                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                        {user.email}
                                                                    </div>
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
                                <div className="p-3 border rounded-lg bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10">
                                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                                                    {selectedUser.name?.charAt(0) || 'U'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium dark:text-gray-200">{selectedUser.name}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{selectedUser.email}</p>
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={clearUser}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            Change
                                        </Button>
                                    </div>
                                </div>
                            )}
                            
                            {errors.user_id && (
                                <p className="text-sm text-red-600 dark:text-red-400">{errors.user_id}</p>
                            )}
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                This position requires system access. Assign an existing user account.
                            </p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}