// components/admin/officials/shared/user-account-form.tsx
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Key, Phone, UserCheck } from 'lucide-react';
import { Resident, Role, Position } from '@/components/admin/officials/shared/types/official';

interface UserAccountFormProps {
    createUserAccount: boolean;
    requiresAccount: boolean;
    username: string;
    roleId: number;
    password: string;
    passwordConfirmation: string;
    showPasswordFields: boolean;
    generatedPassword: string;
    passwordSource: 'random' | 'phone' | 'manual';
    selectedResident: Resident | null;
    roles: Role[];
    currentPosition: Position | null;
    onToggleCreateAccount: (checked: boolean) => void;
    onUsernameChange: (value: string) => void;
    onRoleChange: (value: number) => void;
    onPasswordChange: (value: string) => void;
    onPasswordConfirmationChange: (value: string) => void;
    onToggleShowPassword: (checked: boolean) => void;
    onGeneratePassword: (source: 'random' | 'phone') => void;
    errors?: {
        username?: string;
        password?: string;
        password_confirmation?: string;
    };
}

export function UserAccountForm({
    createUserAccount,
    requiresAccount,
    username,
    roleId,
    password,
    passwordConfirmation,
    showPasswordFields,
    generatedPassword,
    passwordSource,
    selectedResident,
    roles,
    currentPosition,
    onToggleCreateAccount,
    onUsernameChange,
    onRoleChange,
    onPasswordChange,
    onPasswordConfirmationChange,
    onToggleShowPassword,
    onGeneratePassword,
    errors = {}
}: UserAccountFormProps) {
    const getRoleName = (roleId: number) => {
        const role = roles.find(r => r.id === roleId);
        return role ? role.name : 'Viewer';
    };

    return (
        <div className="space-y-4">
            {requiresAccount ? (
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md mb-4">
                    <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400">
                        <UserCheck className="h-4 w-4" />
                        <span className="font-medium">Mandatory Account Creation</span>
                    </div>
                    <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                        This position requires a system account for official duties.
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    <div className="flex items-center space-x-2 p-3 border rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                        <Checkbox 
                            id="create_user_account" 
                            checked={createUserAccount}
                            onCheckedChange={(checked) => onToggleCreateAccount(checked as boolean)}
                            disabled={requiresAccount}
                            className="dark:border-gray-600"
                        />
                        <Label htmlFor="create_user_account" className="cursor-pointer dark:text-gray-300">
                            Create system user account for this official
                        </Label>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Uncheck if you don't want to create a user account
                    </p>
                </div>
            )}

            {(createUserAccount || requiresAccount) && (
                <>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="username" className="dark:text-gray-300">Username *</Label>
                            <Input 
                                id="username" 
                                placeholder="juan.dela.cruz123"
                                value={username}
                                onChange={(e) => onUsernameChange(e.target.value)}
                                className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                            />
                            {errors.username && (
                                <p className="text-sm text-red-600 dark:text-red-400">{errors.username}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role_id" className="dark:text-gray-300">System Role *</Label>
                            <Select 
                                value={roleId.toString()}
                                onValueChange={(value) => onRoleChange(parseInt(value))}
                            >
                                <SelectTrigger className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300">
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                                    {roles.map((role) => (
                                        <SelectItem key={role.id} value={role.id.toString()}>
                                            {role.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Auto-selected based on position: {getRoleName(roleId)}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="dark:text-gray-300">Password</Label>
                            <div className="flex gap-2">
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => onGeneratePassword('random')}
                                    className="flex items-center gap-1"
                                >
                                    <Key className="h-3 w-3" />
                                    Random
                                </Button>
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => onGeneratePassword('phone')}
                                    disabled={!selectedResident?.contact_number}
                                    className="flex items-center gap-1"
                                >
                                    <Phone className="h-3 w-3" />
                                    Use Phone
                                </Button>
                            </div>
                        </div>
                        
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Input 
                                    type={showPasswordFields ? "text" : "password"}
                                    placeholder="Enter password"
                                    value={password}
                                    onChange={(e) => onPasswordChange(e.target.value)}
                                    className="dark:bg-gray-900 dark:border-gray-700"
                                />
                                {generatedPassword && passwordSource === 'random' && (
                                    <p className="text-xs text-green-600 dark:text-green-400">
                                        Generated random password
                                    </p>
                                )}
                                {generatedPassword && passwordSource === 'phone' && (
                                    <p className="text-xs text-blue-600 dark:text-blue-400">
                                        Generated from phone number
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Input 
                                    type={showPasswordFields ? "text" : "password"}
                                    placeholder="Confirm password"
                                    value={passwordConfirmation}
                                    onChange={(e) => onPasswordConfirmationChange(e.target.value)}
                                    className="dark:bg-gray-900 dark:border-gray-700"
                                />
                            </div>
                        </div>

                        {errors.password && (
                            <p className="text-sm text-red-600 dark:text-red-400">{errors.password}</p>
                        )}
                        {errors.password_confirmation && (
                            <p className="text-sm text-red-600 dark:text-red-400">{errors.password_confirmation}</p>
                        )}

                        <div className="flex items-center space-x-2">
                            <Checkbox 
                                id="show_password" 
                                checked={showPasswordFields}
                                onCheckedChange={(checked) => onToggleShowPassword(checked as boolean)}
                                className="dark:border-gray-600"
                            />
                            <Label htmlFor="show_password" className="cursor-pointer dark:text-gray-300">
                                Show password
                            </Label>
                        </div>

                        {passwordSource === 'phone' && selectedResident?.contact_number && (
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                                <p className="text-xs text-blue-700 dark:text-blue-400">
                                    <strong>Password format:</strong> Last 6 digits of phone number + @ + current year<br />
                                    <strong>Example:</strong> {selectedResident.contact_number.replace(/\D/g, '').slice(-6)}@{new Date().getFullYear().toString().slice(-2)}
                                </p>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}