// pages/admin/positions/components/assignment-tab.tsx
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Target, Shield, HelpCircle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Committee {
    id: number;
    name: string;
    is_active: boolean;
}

interface Role {
    id: number;
    name: string;
    description?: string;
}

interface AssignmentTabProps {
    formData: any;
    errors: Record<string, string>;
    committees: Committee[];
    roles: Role[];
    onCommitteeSelect: (committeeId: string) => void;
    onRoleSelect: (roleId: string) => void;
    isSubmitting: boolean;
    isKagawadPosition?: boolean; // Add this prop as optional
}

export function AssignmentTab({
    formData,
    errors,
    committees,
    roles,
    onCommitteeSelect,
    onRoleSelect,
    isSubmitting,
    isKagawadPosition = false // Default to false
}: AssignmentTabProps) {
    const selectedCommittee = formData.committee_id 
        ? committees.find(c => c.id === formData.committee_id)
        : null;
    
    const selectedRole = formData.role_id
        ? roles.find(r => r.id === formData.role_id)
        : null;

    return (
        <TooltipProvider>
            <div className="space-y-4">
                {/* Kagawad reminder */}
                {isKagawadPosition && !selectedCommittee && (
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                                    Kagawad Position Recommendation
                                </p>
                                <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                                    Kagawad positions typically oversee a specific committee. Consider assigning a committee below.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Committee Selection */}
                <div className="space-y-2">
                    <Label htmlFor="committee_id" className="dark:text-gray-300">
                        Primary Committee
                        {isKagawadPosition && !selectedCommittee && (
                            <span className="ml-2 text-xs text-yellow-600 dark:text-yellow-400">
                                (Recommended)
                            </span>
                        )}
                    </Label>
                    <Select
                        value={formData.committee_id?.toString() || "null"}
                        onValueChange={onCommitteeSelect}
                        disabled={isSubmitting}
                    >
                        <SelectTrigger 
                            className={`dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 ${
                                isKagawadPosition && !selectedCommittee ? 'border-yellow-400 dark:border-yellow-600' : ''
                            }`}
                        >
                            <SelectValue placeholder="Select a committee" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                            <SelectItem value="null" className="dark:text-gray-300 dark:focus:bg-gray-700">
                                No committee
                            </SelectItem>
                            {committees.map((committee) => (
                                <SelectItem key={committee.id} value={committee.id.toString()} className="dark:text-gray-300 dark:focus:bg-gray-700">
                                    <div className="flex items-center gap-2">
                                        <Target className="h-3 w-3" />
                                        <span>{committee.name}</span>
                                        {!committee.is_active && (
                                            <Badge variant="outline" className="text-xs dark:border-gray-600">
                                                Inactive
                                            </Badge>
                                        )}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.committee_id && (
                        <p className="text-sm text-red-600 dark:text-red-400">{errors.committee_id}</p>
                    )}
                </div>

                {/* Role Selection */}
                <div className="space-y-2">
                    <Label htmlFor="role_id" className="dark:text-gray-300 flex items-center">
                        System Role
                        <Tooltip>
                            <TooltipTrigger type="button">
                                <HelpCircle className="h-4 w-4 text-gray-400 dark:text-gray-500 ml-1" />
                            </TooltipTrigger>
                            <TooltipContent className="dark:bg-gray-900 dark:text-gray-300">
                                <p>Assigns system permissions when an official holds this position</p>
                            </TooltipContent>
                        </Tooltip>
                    </Label>
                    <Select
                        value={formData.role_id?.toString() || "null"}
                        onValueChange={onRoleSelect}
                        disabled={isSubmitting}
                    >
                        <SelectTrigger className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300">
                            <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                            <SelectItem value="null" className="dark:text-gray-300 dark:focus:bg-gray-700">
                                No role assigned
                            </SelectItem>
                            {roles.map((role) => (
                                <SelectItem key={role.id} value={role.id.toString()} className="dark:text-gray-300 dark:focus:bg-gray-700">
                                    <div className="flex items-center gap-2">
                                        <Shield className="h-3 w-3" />
                                        <span>{role.name}</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.role_id && (
                        <p className="text-sm text-red-600 dark:text-red-400">{errors.role_id}</p>
                    )}
                </div>

                {/* Selected Committee Preview */}
                {selectedCommittee && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <span className="text-sm font-medium text-blue-800 dark:text-blue-300">Selected Committee:</span>
                            <span className="text-sm text-blue-700 dark:text-blue-400">{selectedCommittee.name}</span>
                        </div>
                    </div>
                )}

                {/* Selected Role Preview */}
                {selectedRole && (
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                        <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                            <span className="text-sm font-medium text-purple-800 dark:text-purple-300">Selected Role:</span>
                            <span className="text-sm text-purple-700 dark:text-purple-400">{selectedRole.name}</span>
                        </div>
                        {selectedRole.description && (
                            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1 ml-6">
                                {selectedRole.description}
                            </p>
                        )}
                    </div>
                )}
            </div>
        </TooltipProvider>
    );
}