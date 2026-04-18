// components/admin/announcements/create/audience-tab.tsx
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Users, MapPin, Home, Briefcase, UserCog, Globe, CheckCircle } from 'lucide-react';
import type { AudienceType, Role, Purok, Household, Business, User } from '@/types/admin/announcements/announcement.types';
import { LucideIcon } from 'lucide-react';

interface AudienceTabProps {
    formData: {
        audience_type: AudienceType;
        target_roles: number[];
        target_puroks: number[];
        target_households: number[];
        target_businesses: number[];
        target_users: number[];
        [key: string]: any;
    };
    errors: Record<string, string>;
    audienceOptions: Array<{ value: AudienceType; label: string }>;
    roles: Role[];
    puroks: Purok[];
    households: Household[];
    businesses: Business[];
    users: User[];
    getAudienceIcon: (type: AudienceType) => LucideIcon;
    onSelectChange: (name: string, value: string) => void;
    onMultiSelectChange: (name: string, value: number[]) => void;
    isSubmitting: boolean;
}

export function AudienceTab({
    formData,
    errors,
    audienceOptions,
    roles,
    puroks,
    households,
    businesses,
    users,
    getAudienceIcon,
    onSelectChange,
    onMultiSelectChange,
    isSubmitting
}: AudienceTabProps) {
    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="audience_type" className="dark:text-gray-300">
                    Audience Type <span className="text-red-500">*</span>
                </Label>
                <Select
                    value={formData.audience_type}
                    onValueChange={(value) => onSelectChange('audience_type', value as AudienceType)}
                    disabled={isSubmitting}
                >
                    <SelectTrigger className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300">
                        <SelectValue placeholder="Select audience type" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                        {audienceOptions.map((audience) => {
                            const IconComponent = getAudienceIcon(audience.value);
                            return (
                                <SelectItem key={audience.value} value={audience.value} className="dark:text-gray-300 dark:focus:bg-gray-700">
                                    <div className="flex items-center gap-2">
                                        <IconComponent className="h-4 w-4" />
                                        {audience.label}
                                    </div>
                                </SelectItem>
                            );
                        })}
                    </SelectContent>
                </Select>
            </div>

            {/* Role Selection */}
            {formData.audience_type === 'roles' && (
                <div className="space-y-2">
                    <Label className="dark:text-gray-300">Select Roles</Label>
                    <div className="border rounded-lg dark:border-gray-700 p-4 max-h-48 overflow-y-auto">
                        <div className="space-y-2">
                            {roles.map((role) => (
                                <div key={role.id} className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id={`role-${role.id}`}
                                        checked={formData.target_roles.includes(role.id)}
                                        onChange={(e) => {
                                            const newValue = e.target.checked
                                                ? [...formData.target_roles, role.id]
                                                : formData.target_roles.filter((id: number) => id !== role.id);
                                            onMultiSelectChange('target_roles', newValue);
                                        }}
                                        className="rounded border-gray-300 dark:border-gray-600"
                                        disabled={isSubmitting}
                                    />
                                    <Label htmlFor={`role-${role.id}`} className="cursor-pointer dark:text-gray-300">
                                        {role.name}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>
                    {errors.target_roles && (
                        <p className="text-sm text-red-600 dark:text-red-400">{errors.target_roles}</p>
                    )}
                </div>
            )}

            {/* Purok Selection */}
            {formData.audience_type === 'puroks' && (
                <div className="space-y-2">
                    <Label className="dark:text-gray-300">Select Puroks</Label>
                    <div className="border rounded-lg dark:border-gray-700 p-4 max-h-48 overflow-y-auto">
                        <div className="space-y-2">
                            {puroks.map((purok) => (
                                <div key={purok.id} className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id={`purok-${purok.id}`}
                                        checked={formData.target_puroks.includes(purok.id)}
                                        onChange={(e) => {
                                            const newValue = e.target.checked
                                                ? [...formData.target_puroks, purok.id]
                                                : formData.target_puroks.filter((id: number) => id !== purok.id);
                                            onMultiSelectChange('target_puroks', newValue);
                                        }}
                                        className="rounded border-gray-300 dark:border-gray-600"
                                        disabled={isSubmitting}
                                    />
                                    <Label htmlFor={`purok-${purok.id}`} className="cursor-pointer dark:text-gray-300">
                                        Purok {purok.name}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>
                    {errors.target_puroks && (
                        <p className="text-sm text-red-600 dark:text-red-400">{errors.target_puroks}</p>
                    )}
                </div>
            )}

            {/* Household Selection */}
            {(formData.audience_type === 'households' || formData.audience_type === 'household_members') && (
                <div className="space-y-2">
                    <Label className="dark:text-gray-300">
                        Select Households
                        {formData.audience_type === 'household_members' && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                                (All members of selected households)
                            </span>
                        )}
                    </Label>
                    <div className="border rounded-lg dark:border-gray-700 p-4 max-h-48 overflow-y-auto">
                        <div className="space-y-2">
                            {households.map((household) => (
                                <div key={household.id} className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id={`household-${household.id}`}
                                        checked={formData.target_households.includes(household.id)}
                                        onChange={(e) => {
                                            const newValue = e.target.checked
                                                ? [...formData.target_households, household.id]
                                                : formData.target_households.filter((id: number) => id !== household.id);
                                            onMultiSelectChange('target_households', newValue);
                                        }}
                                        className="rounded border-gray-300 dark:border-gray-600"
                                        disabled={isSubmitting}
                                    />
                                    <Label htmlFor={`household-${household.id}`} className="cursor-pointer dark:text-gray-300">
                                        {household.household_number}
                                        {household.purok && (
                                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                                                (Purok {household.purok.name})
                                            </span>
                                        )}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>
                    {errors.target_households && (
                        <p className="text-sm text-red-600 dark:text-red-400">{errors.target_households}</p>
                    )}
                </div>
            )}

            {/* Business Selection */}
            {formData.audience_type === 'businesses' && (
                <div className="space-y-2">
                    <Label className="dark:text-gray-300">Select Businesses</Label>
                    <div className="border rounded-lg dark:border-gray-700 p-4 max-h-48 overflow-y-auto">
                        <div className="space-y-2">
                            {businesses.map((business) => (
                                <div key={business.id} className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id={`business-${business.id}`}
                                        checked={formData.target_businesses.includes(business.id)}
                                        onChange={(e) => {
                                            const newValue = e.target.checked
                                                ? [...formData.target_businesses, business.id]
                                                : formData.target_businesses.filter((id: number) => id !== business.id);
                                            onMultiSelectChange('target_businesses', newValue);
                                        }}
                                        className="rounded border-gray-300 dark:border-gray-600"
                                        disabled={isSubmitting}
                                    />
                                    <Label htmlFor={`business-${business.id}`} className="cursor-pointer dark:text-gray-300">
                                        {business.business_name}
                                        {business.owner_name && (
                                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                                                ({business.owner_name})
                                            </span>
                                        )}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>
                    {errors.target_businesses && (
                        <p className="text-sm text-red-600 dark:text-red-400">{errors.target_businesses}</p>
                    )}
                </div>
            )}

            {/* User Selection */}
            {formData.audience_type === 'specific_users' && (
                <div className="space-y-2">
                    <Label className="dark:text-gray-300">Select Users</Label>
                    <div className="border rounded-lg dark:border-gray-700 p-4 max-h-48 overflow-y-auto">
                        <div className="space-y-2">
                            {users.map((user) => (
                                <div key={user.id} className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id={`user-${user.id}`}
                                        checked={formData.target_users.includes(user.id)}
                                        onChange={(e) => {
                                            const newValue = e.target.checked
                                                ? [...formData.target_users, user.id]
                                                : formData.target_users.filter((id: number) => id !== user.id);
                                            onMultiSelectChange('target_users', newValue);
                                        }}
                                        className="rounded border-gray-300 dark:border-gray-600"
                                        disabled={isSubmitting}
                                    />
                                    <Label htmlFor={`user-${user.id}`} className="cursor-pointer dark:text-gray-300">
                                        {user.first_name} {user.last_name}
                                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                                            ({user.email})
                                        </span>
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>
                    {errors.target_users && (
                        <p className="text-sm text-red-600 dark:text-red-400">{errors.target_users}</p>
                    )}
                </div>
            )}

            {/* Selection Summary */}
            {(formData.audience_type !== 'all' && (
                (formData.target_roles.length > 0 ||
                 formData.target_puroks.length > 0 ||
                 formData.target_households.length > 0 ||
                 formData.target_businesses.length > 0 ||
                 formData.target_users.length > 0)
            )) && (
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5" />
                        <div className="text-sm text-green-700 dark:text-green-300">
                            <span className="font-medium">Targeted Audience:</span>{' '}
                            {formData.target_roles.length > 0 && `${formData.target_roles.length} role(s)`}
                            {formData.target_puroks.length > 0 && ` ${formData.target_puroks.length} purok(s)`}
                            {formData.target_households.length > 0 && ` ${formData.target_households.length} household(s)`}
                            {formData.target_businesses.length > 0 && ` ${formData.target_businesses.length} business(es)`}
                            {formData.target_users.length > 0 && ` ${formData.target_users.length} user(s)`}
                            {' will receive this announcement'}
                        </div>
                    </div>
                </div>
            )}

            {/* Help text */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div className="flex-1">
                        <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">👥 Audience Targeting Guide</h4>
                        <ul className="list-disc list-inside space-y-1 text-xs text-blue-700 dark:text-blue-300">
                            <li><strong>All Users:</strong> Announcement visible to everyone</li>
                            <li><strong>Roles:</strong> Target specific user roles (e.g., Admin, Staff)</li>
                            <li><strong>Puroks:</strong> Target residents in specific puroks</li>
                            <li><strong>Households:</strong> Target specific households</li>
                            <li><strong>Household Members:</strong> Target all members of selected households</li>
                            <li><strong>Businesses:</strong> Target registered business owners</li>
                            <li><strong>Specific Users:</strong> Target individual users by name</li>
                        </ul>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                            Note: Announcements will only be shown to users who match ALL selected criteria.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}