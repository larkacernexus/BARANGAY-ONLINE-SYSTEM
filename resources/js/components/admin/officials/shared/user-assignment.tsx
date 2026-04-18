// components/admin/officials/shared/user-assignment.tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { AlertCircle, UserCheck, Shield, Users } from 'lucide-react';
import { Resident, User, Position } from './types/official';
import { Badge } from '@/components/ui/badge';

interface UserAssignmentProps {
    availableUsers: User[];
    selectedResident: Resident | null;
    selectedPosition: Position | null;
    selectedUserId: number | null;
    selectedUser: User | null;
    onUserSelect: (userId: number) => void;
    error?: string;
    disabled?: boolean;
}

export function UserAssignment({ 
    availableUsers = [],
    selectedResident,
    selectedPosition,
    selectedUserId, 
    selectedUser,
    onUserSelect, 
    error,
    disabled = false
}: UserAssignmentProps) {
    const users = availableUsers || [];
    
    // Filter users that match the selected position
    const getPositionUsers = () => {
        if (!selectedPosition) return [];
        
        return users.filter(u => 
            u.position === selectedPosition.name ||
            u.role_id === selectedPosition.role_id ||
            u.username?.toLowerCase().includes(selectedPosition.code.toLowerCase())
        );
    };

    const positionUsers = getPositionUsers();

    if (!selectedPosition) {
        return (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                    <Users className="h-4 w-4" />
                    <p className="text-sm">Select a position first to see available position accounts.</p>
                </div>
            </div>
        );
    }

    if (selectedPosition && !selectedPosition.requires_account) {
        return (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                    <UserCheck className="h-4 w-4" />
                    <p className="text-sm">This position does not require a system account.</p>
                </div>
            </div>
        );
    }

    if (positionUsers.length === 0) {
        return (
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <div>
                        <h4 className="font-medium text-amber-800 dark:text-amber-300">No Position Account Found</h4>
                        <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                            There is no user account for {selectedPosition.name} yet.
                            You need to create a position account first.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label className="dark:text-gray-300">
                    Select {selectedPosition.name} Account <span className="text-red-500">*</span>
                </Label>
                <Select 
                    value={selectedUserId?.toString() || ''} 
                    onValueChange={(value) => onUserSelect(parseInt(value))}
                    disabled={disabled}
                >
                    <SelectTrigger className={error ? 'border-red-500 dark:border-red-500' : 'dark:bg-gray-900 dark:border-gray-700'}>
                        <SelectValue placeholder={`Choose a ${selectedPosition.code} account...`} />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                        {positionUsers.map((user) => (
                            <SelectItem 
                                key={user.id} 
                                value={user.id.toString()}
                                className="dark:text-gray-300 dark:focus:bg-gray-800"
                            >
                                <div className="flex items-center gap-2">
                                    <Shield className="h-4 w-4 text-amber-600" />
                                    <span className="font-medium">{user.username}</span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        ({user.position || 'Position Account'})
                                    </span>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}
            </div>

            {selectedUser && selectedResident && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-start gap-3">
                        <UserCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        <div className="text-sm">
                            <p className="font-medium text-blue-800 dark:text-blue-300">
                                Assigning: {selectedUser.username}
                            </p>
                            <p className="text-blue-700 dark:text-blue-400 mt-1">
                                This position account will be assigned to: <br />
                                <span className="font-medium">
                                    {selectedResident.last_name}, {selectedResident.first_name}
                                    {selectedResident.middle_name && ` ${selectedResident.middle_name}`}
                                </span>
                            </p>
                            <p className="text-blue-700 dark:text-blue-400 mt-2 text-xs">
                                The resident will use this account to login as {selectedPosition?.name}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}